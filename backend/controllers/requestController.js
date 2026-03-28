const RideRequest = require("../models/RideRequest");
const Ride = require("../models/Ride");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");

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

        // --- EMAIL LOGIC (Non-blocking) ---
        Promise.all([
            User.findById(req.user),
            User.findById(ride.driver)
        ]).then(([passengerUser, driverUser]) => {
            if (passengerUser && driverUser) {
                // Email Passenger
                sendEmail({
                    to: "asfarbros@gmail.com",//passengerUser.email,
                    subject: "Ride Request Sent - Campus Rideshare",
                    html: `<h1>Request Sent!</h1>
                           <p>Hi ${passengerUser.name}, your request to join the ride from <b>${ride.from}</b> to <b>${ride.to}</b> on ${ride.date} at ${ride.time} has been sent to the driver.</p>`
                });

                // Email Driver
                sendEmail({
                    to: driverUser.email,
                    subject: "New Ride Request! - Campus Rideshare",
                    html: `<h1>New Request!</h1>
                           <p>Hi ${driverUser.name}, you have a new request from <b>${passengerUser.name}</b> for your ride from ${ride.from} to ${ride.to} on ${ride.date}.</p>
                           <p>Login to accept or reject the request.</p>`
                });
            }
        }).catch(err => console.error("Failed to fetch users for email:", err));

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

        const request = await RideRequest.findById(requestId).populate("ride passenger");

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

        // --- EMAIL LOGIC (Non-blocking) ---
        if (status === "accepted" && request.passenger && request.passenger.email) {
            sendEmail({
                to: request.passenger.email,
                subject: "Ride Request ACCEPTED! - Campus Rideshare",
                html: `<h1>Request Accepted!</h1>
                       <p>Hi ${request.passenger.name}, your driver has accepted your request for the ride from <b>${request.ride.from}</b> to <b>${request.ride.to}</b> on ${request.ride.date} at ${request.ride.time}.</p>
                       <p>Have a great trip!</p>`
            });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Passenger views their requested rides
exports.getMyRides = async (req, res) => {
    try {
        const requests = await RideRequest.find({ passenger: req.user })
            .populate({
                path: "ride",
                populate: {
                    path: "driver",
                    select: "name email"
                }
            })
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};