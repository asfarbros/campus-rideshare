const TravelPost = require("../models/TravelPost");
const ConnectionRequest = require("../models/ConnectionRequest");

// POST /api/hosteller/posts
exports.createPost = async (req, res) => {
    try {
        const { destination, travelDate, note } = req.body;

        if (!destination || !travelDate) {
            return res.status(400).json({ message: "destination and travelDate are required" });
        }

        const post = await TravelPost.create({
            creator: req.user,
            destination,
            travelDate,
            note
        });

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/hosteller/posts?destination=Chennai&date=2025-06-10
exports.getAllPosts = async (req, res) => {
    try {
        const { destination, date } = req.query;

        const filter = { status: "open" };

        if (destination) {
            filter.destination = { $regex: destination, $options: "i" };
        }
        if (date) {
            filter.travelDate = date;
        }

        const posts = await TravelPost.find(filter)
            .populate("creator", "name")
            .sort({ travelDate: 1, createdAt: -1 });

        // Attach accepted connection count to each post
        const postIds = posts.map(p => p._id);

        const counts = await ConnectionRequest.aggregate([
            { $match: { post: { $in: postIds }, status: "accepted" } },
            { $group: { _id: "$post", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach(c => { countMap[c._id.toString()] = c.count; });

        const result = posts.map(p => ({
            ...p.toObject(),
            acceptedCount: countMap[p._id.toString()] || 0
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/hosteller/posts/my
exports.getMyPosts = async (req, res) => {
    try {
        const posts = await TravelPost.find({ creator: req.user })
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/hosteller/posts/:id
exports.deletePost = async (req, res) => {
    try {
        const post = await TravelPost.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.creator.toString() !== req.user.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await TravelPost.findByIdAndDelete(req.params.id);

        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/hosteller/posts/:id/close
exports.closePost = async (req, res) => {
    try {
        const post = await TravelPost.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.creator.toString() !== req.user.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        post.status = "closed";
        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
