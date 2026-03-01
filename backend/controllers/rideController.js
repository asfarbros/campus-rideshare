const Ride = require("../models/Ride");

exports.createRide = async (req, res) => {
    try {
        const ride = await Ride.create({
            ...req.body,
            driver: req.user
        });

        res.status(201).json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRidesByArea = async (req, res) => {
    try {
        const { area,type } = req.query;

        const rides = await Ride.find({
            routeAreas: area,
            seatsAvailable: { $gt: 0 }
        }).populate("driver", "name email");

        res.json(rides);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};