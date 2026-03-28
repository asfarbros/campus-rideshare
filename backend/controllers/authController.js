const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email.endsWith("@ssn.edu.in")) {
            return res.status(400).json({ message: "Use college email only" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: "User registered" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clerkAuth = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email.endsWith("@ssn.edu.in")) {
            return res.status(400).json({ message: "Use college email only" });
        }

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name,
                email,
                password: hashedPassword
            });
            isNewUser = true;

            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: email,
                subject: "Welcome to Campus Rideshare!",
                html: `<h1>Welcome!</h1><p>Thanks for signing up to Campus Rideshare, ${name}!</p>`
            });
        } else {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: email,
                subject: "New sign-in to Campus Rideshare",
                html: `<h1>Hello again!</h1><p>You have successfully signed in to your Campus Rideshare account.</p>`
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user: { name: user.name, email: user.email } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
