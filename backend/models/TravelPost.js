const mongoose = require("mongoose");

const travelPostSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    travelDate: {
        type: String,
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open"
    }
}, { timestamps: true });

module.exports = mongoose.model("TravelPost", travelPostSchema);
