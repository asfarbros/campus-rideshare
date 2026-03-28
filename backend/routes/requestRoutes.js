const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
    createRequest,
    getRequestsForDriver,
    updateRequestStatus,
    getMyRides
} = require("../controllers/requestController");

router.post("/", auth, createRequest);
router.get("/driver", auth, getRequestsForDriver);
router.get("/my-requests", auth, getMyRides);
router.put("/", auth, updateRequestStatus);

module.exports = router;