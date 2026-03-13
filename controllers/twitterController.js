const TwitterPost = require('../models/TwitterPost');

// @desc    Get all twitter posts
// @route   GET /api/v1/social/twitter-marketplace
// @access  Public
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await TwitterPost.find({ isActive: true });
        res.status(200).json({
            status: 'success',
            results: posts.length,
            data: { posts }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// @desc    Create new twitter post
// @route   POST /api/v1/social/twitter-marketplace
// @access  Private (Admin)
exports.createPost = async (req, res) => {
    try {
        const newPost = await TwitterPost.create({
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

// @desc    Update twitter post
// @route   PATCH /api/v1/social/twitter-marketplace/:id
// @access  Private (Admin)
exports.updatePost = async (req, res) => {
    try {
        const post = await TwitterPost.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete twitter post
// @route   DELETE /api/v1/social/twitter-marketplace/:id
// @access  Private (Admin)
exports.deletePost = async (req, res) => {
    try {
        const post = await TwitterPost.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Post not found' });
        }
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// @desc    Activate/Buy post
// @route   POST /api/v1/social/twitter-marketplace/activate/:id
// @access  Private (User)
exports.activatePost = async (req, res) => {
    try {
        const post = await TwitterPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Post not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Post activated successfully!',
            data: { post }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
