const User = require("../models/User");
const { sendEmail } = require("../utils/email");

exports.clerkAuth = async (req, res) => {
    try {
        const { clerkId, email, name } = req.body;

        if (!clerkId || !email) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Try to find the user by clerkId first
        let user = await User.findOne({ clerkId });
        
        // Backwards compatibility: If user doesn't have clerkId but exists by email, link them
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                user.clerkId = clerkId;
                await user.save();
            }
        }

        if (!user) {
            // New user registration
            user = await User.create({
                clerkId,
                name,
                email
            });

            await sendEmail({
                to: email,
                subject: "Welcome to Campus Rideshare!",
                html: `<h1>Welcome!</h1><p>Thanks for signing up to Campus Rideshare, ${name}!</p>`
            });
        }

        // We don't send a token back because the frontend already has the Clerk session token
        res.json({ message: "User synced successfully", user: { name: user.name, email: user.email } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
