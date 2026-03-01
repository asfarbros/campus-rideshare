const RideRequest = require("../models/RideRequest");
const Ride = require("../models/Ride");

// Passenger sends request
exports.createRequest = async (req, res) => {
    try {
        const { rideId } = req.body;

        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        if(ride.driver.toString() === req.user.toString()) {
            return res.status(400).json({ message: "Cannot request your own ride" });
        }

        if (ride.seatsAvailable <= 0) {
            return res.status(400).json({ message: "No seats available" });
        }

        const existingRequest = await RideRequest.findOne({
            ride: rideId,
            passenger: req.user
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Already requested" });
        }

        const request = await RideRequest.create({
            ride: rideId,
            passenger: req.user
        });

        res.status(201).json(request);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Driver views requests for their ride
exports.getRequestsForDriver = async (req, res) => {
    try {
        const rides = await Ride.find({ driver: req.user });

        const rideIds = rides.map(r => r._id);

        const requests = await RideRequest.find({
            ride: { $in: rideIds }
        }).populate("passenger", "name email")
            .populate("ride");

        res.json(requests);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Driver accepts/rejects request
exports.updateRequestStatus = async (req, res) => {
    try {
        const { requestId, status } = req.body;

        // ✅ Allow only valid statuses
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const request = await RideRequest.findById(requestId).populate("ride");

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // ✅ Check if logged-in user is the driver
        if (request.ride.driver.toString() !== req.user.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // ✅ Prevent double seat deduction
        if (status === "accepted" && request.status !== "accepted") {

            if (request.ride.seatsAvailable <= 0) {
                return res.status(400).json({ message: "No seats left" });
            }

            request.ride.seatsAvailable -= 1;
            await request.ride.save();
        }

        request.status = status;
        await request.save();

        res.json(request);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};