const Location = require("../models/Location");

exports.searchLocations = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) return res.json([]);
        
        // Case-insensitive regex search
        const locations = await Location.find({
            name: { $regex: `^${search}`, $options: "i" }
        }).limit(5);
        
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
};
