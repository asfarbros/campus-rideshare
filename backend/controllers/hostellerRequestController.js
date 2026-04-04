const ConnectionRequest = require("../models/ConnectionRequest");
const TravelPost = require("../models/TravelPost");

// POST /api/hosteller/requests
exports.sendRequest = async (req, res) => {
    try {
        const { postId } = req.body;

        if (!postId) return res.status(400).json({ message: "postId is required" });

        const post = await TravelPost.findById(postId);

        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.status === "closed") {
            return res.status(400).json({ message: "This post is no longer accepting requests" });
        }

        if (post.creator.toString() === req.user.toString()) {
            return res.status(400).json({ message: "Cannot request your own post" });
        }

        const request = await ConnectionRequest.create({
            post: postId,
            sender: req.user
        });

        res.status(201).json(request);
    } catch (err) {
        // Duplicate key error from unique index
        if (err.code === 11000) {
            return res.status(409).json({ message: "Request already sent" });
        }
        res.status(500).json({ error: err.message });
    }
};

// GET /api/hosteller/requests/incoming
exports.getIncoming = async (req, res) => {
    try {
        // Find all posts owned by current user
        const myPosts = await TravelPost.find({ creator: req.user }).select("_id");
        const myPostIds = myPosts.map(p => p._id);

        const requests = await ConnectionRequest.find({ post: { $in: myPostIds } })
            .populate("sender", "name")
            .populate("post", "destination travelDate")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/hosteller/requests/outgoing
exports.getOutgoing = async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({ sender: req.user })
            .populate({
                path: "post",
                select: "destination travelDate status",
                populate: { path: "creator", select: "name" }
            })
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/hosteller/requests/:id/accept
exports.acceptRequest = async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.id)
            .populate("post");

        if (!request) return res.status(404).json({ message: "Request not found" });

        if (request.post.creator.toString() !== req.user.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        request.status = "accepted";
        await request.save();

        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/hosteller/requests/:id/reject
exports.rejectRequest = async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.id)
            .populate("post");

        if (!request) return res.status(404).json({ message: "Request not found" });

        if (request.post.creator.toString() !== req.user.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        request.status = "rejected";
        await request.save();

        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
