const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TravelPost",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

// DB-level guard: one sender can only request a given post once
connectionRequestSchema.index({ post: 1, sender: 1 }, { unique: true });

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
