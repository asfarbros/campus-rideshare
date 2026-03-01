const router = require("express").Router();
const { createRide, getRidesByArea } = require("../controllers/rideController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, createRide);
router.get("/", getRidesByArea);

module.exports = router;