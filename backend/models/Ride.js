const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    from: String,
    to: String,
    routeAreas: [String],
    date: String,
    time: String,
    seatsAvailable: Number
}, { timestamps: true });

module.exports = mongoose.model("Ride", rideSchema);