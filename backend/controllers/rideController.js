const Ride = require("../models/Ride");
const RideRequest = require("../models/RideRequest");

exports.createRide = async (req, res) => {
    try {
        const ride = await Ride.create({
            ...req.body,
            driver: req.user // Associates the logged-in user as the driver
        });
        res.status(201).json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRidesByArea = async (req, res) => {
    try {
        const { area } = req.query;

        const todayStr = new Date().toISOString().split("T")[0];

        // Using regex to make searching 'tambaram' find 'Tambaram'
        const rides = await Ride.find({
            routeAreas: { $regex: new RegExp(area, 'i') }, 
            seatsAvailable: { $gt: 0 },
            date: { $gte: todayStr }
        }).populate("driver", "name email"); // Fetches driver name/email from User model

        res.json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyPostedRides = async (req, res) => {
    try {
        console.log("getMyPostedRides called for user:", req.user);
        const rides = await Ride.find({ driver: req.user }).lean().sort({ createdAt: -1 });
        console.log(`Found ${rides.length} posted rides for user ${req.user}`);
        
        const rideIds = rides.map(r => r._id);
        const acceptedRequests = await RideRequest.find({
            ride: { $in: rideIds },
            status: "accepted"
        }).populate("passenger", "name email").lean();

        const requestsByRide = {};
        for (const reqObj of acceptedRequests) {
            const rideStrId = reqObj.ride.toString();
            if (!requestsByRide[rideStrId]) {
                requestsByRide[rideStrId] = [];
            }
            requestsByRide[rideStrId].push(reqObj.passenger);
        }

        const ridesWithPassengers = rides.map(ride => ({
            ...ride,
            acceptedPassengers: requestsByRide[ride._id.toString()] || []
        }));

        res.json(ridesWithPassengers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};