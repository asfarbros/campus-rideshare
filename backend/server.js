const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");
const locationRoutes = require("./routes/locationRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:5173", 
  process.env.FRONTEND_URL // Vercel production domain
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/hosteller", require("./routes/hostellerRoutes"));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/chat", chatRoutes);

app.get("/test", (req, res) => {
    res.json({ message: "Server + MongoDB working" });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch(err => console.log(err));