const Ride = require("../models/Ride");

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

        // Using regex to make searching 'tambaram' find 'Tambaram'
        const rides = await Ride.find({
            routeAreas: { $regex: new RegExp(area, 'i') }, 
            seatsAvailable: { $gt: 0 }
        }).populate("driver", "name email"); // Fetches driver name/email from User model

        res.json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyPostedRides = async (req, res) => {
    try {
        const rides = await Ride.find({ driver: req.user }).sort({ createdAt: -1 });
        res.json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};