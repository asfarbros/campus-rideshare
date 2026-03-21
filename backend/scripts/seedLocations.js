const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Location = require("../models/Location");
const data = require("../tamilnadu-locations.json");

dotenv.config({ path: __dirname + "/../.env" });
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("DB connected");

        await Location.deleteMany(); 
        await Location.insertMany(data);

        console.log("Inserted successfully");
        process.exit();
    })
    .catch((err) => console.log(err));