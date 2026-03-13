const LinkedinPost = require('../models/LinkedinPost');

// @desc    Get all linkedin posts
// @route   GET /api/v1/linkedin
// @access  Public
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await LinkedinPost.find({ isActive: true });
        res.status(200).json({
            status: 'success',
            results: posts.length,
            data: { posts }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// @desc    Create new linkedin post
// @route   POST /api/v1/linkedin
// @access  Private (Admin)
exports.createPost = async (req, res) => {
    try {
        const newPost = await LinkedinPost.create({
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

// @desc    Update linkedin post
// @route   PATCH /api/v1/linkedin/:id
// @access  Private (Admin)
exports.updatePost = async (req, res) => {
    try {
        const post = await LinkedinPost.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete linkedin post
// @route   DELETE /api/v1/linkedin/:id
// @access  Private (Admin)
exports.deletePost = async (req, res) => {
    try {
        const post = await LinkedinPost.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Post not found' });
        }
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// @desc    Activate/Buy post
// @route   POST /api/v1/linkedin/activate/:id
// @access  Private (User)
exports.activatePost = async (req, res) => {
    try {
        const post = await LinkedinPost.findById(req.params.id);
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
