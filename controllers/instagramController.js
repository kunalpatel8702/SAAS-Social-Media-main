const InstagramPost = require('../models/InstagramPost');

// @desc    Get all instagram posts
// @route   GET /api/v1/instagram
// @access  Public
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await InstagramPost.find({ isActive: true });
        res.status(200).json({
            status: 'success',
            results: posts.length,
            data: { posts }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// @desc    Create new instagram post
// @route   POST /api/v1/instagram
// @access  Private (Admin)
exports.createPost = async (req, res) => {
    try {
        const newPost = await InstagramPost.create({
            ...req.body,
            adminId: req.admin ? req.admin._id : null
        });
        res.status(201).json({
            status: 'success',
            data: { post: newPost }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// @desc    Update instagram post
// @route   PATCH /api/v1/instagram/:id
// @access  Private (Admin)
exports.updatePost = async (req, res) => {
    try {
        const post = await InstagramPost.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Post not found' });
        }
        res.status(200).json({ status: 'success', data: { post } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// @desc    Delete instagram post
// @route   DELETE /api/v1/instagram/:id
// @access  Private (Admin)
exports.deletePost = async (req, res) => {
    try {
        const post = await InstagramPost.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Post not found' });
        }
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// @desc    Activate/Buy post
// @route   POST /api/v1/instagram/activate/:id
// @access  Private (User)
exports.activatePost = async (req, res) => {
    try {
        const post = await InstagramPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Post not found' });
        }

        // Logical activation: In a real app, this might create a UserSubscription or similar
        // For now, we'll just return success to simulate the "buying/activation" flow
        // The user can then see this in their "Active" posts.

        res.status(200).json({
            status: 'success',
            message: 'Post activated successfully!',
            data: { post }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
