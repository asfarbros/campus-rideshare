const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
    createRequest,
    getRequestsForDriver,
    updateRequestStatus
} = require("../controllers/requestController");

router.post("/", auth, createRequest);
router.get("/driver", auth, getRequestsForDriver);
router.put("/", auth, updateRequestStatus);

module.exports = router;