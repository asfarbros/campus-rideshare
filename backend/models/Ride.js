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
    seatsAvailable: Number,
    vehicleType: {
        type: String,
        enum: ["car", "bike"],
        required: true,
        default: "car"
    }
}, { timestamps: true });

module.exports = mongoose.model("Ride", rideSchema);