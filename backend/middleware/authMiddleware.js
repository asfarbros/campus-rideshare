const { clerkClient } = require("@clerk/clerk-sdk-node");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        // Verify the Clerk session token
        const decoded = await clerkClient.verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        // Find the user in MongoDB using the clerkId (which is decoded.sub)
        const user = await User.findOne({ clerkId: decoded.sub });
        
        if (!user) {
            return res.status(401).json({ message: "User not synced in database" });
        }

        // Attach MongoDB user ID to req.user to keep compatibility with existing controllers
        req.user = user._id;
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ message: "Invalid token" });
    }
};