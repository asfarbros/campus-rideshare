const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/requests", require("./routes/requestRoutes"));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);

app.get("/test", (req, res) => {
    res.json({ message: "Server + MongoDB working" });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch(err => console.log(err));