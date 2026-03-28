const router = require("express").Router();
const { createRide, getRidesByArea, getMyPostedRides } = require("../controllers/rideController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, createRide);
router.get("/my-posted", auth, getMyPostedRides);
router.get("/", getRidesByArea);

module.exports = router;