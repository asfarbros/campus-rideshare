const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    clerkId: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        // Made optional since Clerk manages passwords
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);