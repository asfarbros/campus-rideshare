const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");

// The frontend will send POST requests to /api/chat
router.post("/", handleChat);

module.exports = router;