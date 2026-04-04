const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
    createPost,
    getAllPosts,
    getMyPosts,
    deletePost,
    closePost
} = require("../controllers/hostellerPostController");

const {
    sendRequest,
    getIncoming,
    getOutgoing,
    acceptRequest,
    rejectRequest
} = require("../controllers/hostellerRequestController");

// ── Post routes ──────────────────────────────────────
router.post("/posts", auth, createPost);
router.get("/posts", auth, getAllPosts);
router.get("/posts/my", auth, getMyPosts);
router.delete("/posts/:id", auth, deletePost);
router.patch("/posts/:id/close", auth, closePost);

// ── Request routes ───────────────────────────────────
router.post("/requests", auth, sendRequest);
router.get("/requests/incoming", auth, getIncoming);
router.get("/requests/outgoing", auth, getOutgoing);
router.put("/requests/:id/accept", auth, acceptRequest);
router.put("/requests/:id/reject", auth, rejectRequest);

module.exports = router;
