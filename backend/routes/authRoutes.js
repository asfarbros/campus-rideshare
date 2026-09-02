const express = require("express");
const { clerkAuth } = require("../controllers/authController");

const router = express.Router();

router.post("/clerk-auth", clerkAuth);

module.exports = router;