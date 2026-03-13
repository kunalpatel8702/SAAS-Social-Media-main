const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUpload, getVideoUpload } = require('../middlewares/uploadMiddleware');
const { protect } = require('../controllers/authController');
const { fetchMediaUrl } = require('../controllers/mediaFetchController');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Middleware: accepts both user tokens and admin tokens
const flexAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'fail', message: 'No token provided.' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try User first, then Admin
        const user = await User.findById(decoded.id);
        if (user) {
            req.user = user;
            return next();
        }
        const admin = await Admin.findById(decoded.id);
        if (admin) {
            req.admin = admin;
            req.user = admin; // normalise so key logic below works
            return next();
        }
        return res.status(401).json({ status: 'fail', message: 'User not found.' });
    } catch (err) {
        return res.status(401).json({ status: 'fail', message: 'Invalid or expired token.' });
    }
};

// POST /api/v1/upload/image
router.post('/image', flexAuth, (req, res) => {
    const handleUpload = getUpload().single('file');
    handleUpload(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    status: 'fail',
                    message: 'File too large. Maximum size is 8 MB.',
                });
            }
            return res.status(400).json({
                status: 'fail',
                message: err.message || 'File upload failed.',
            });
        }

        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
        }

        const key = req.file.key;
        const publicUrl = `${process.env.CF_PUBLIC_URL}/${key}`;

        return res.status(200).json({
            status: 'success',
            url: publicUrl,
            key,
        });
    });
});

// POST /api/v1/upload/video
router.post('/video', flexAuth, (req, res) => {
    const handleUpload = getVideoUpload().single('file');
    handleUpload(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    status: 'fail',
                    message: 'File too large. Maximum size is 100 MB.',
                });
            }
            return res.status(400).json({
                status: 'fail',
                message: err.message || 'File upload failed.',
            });
        }

        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
        }

        const key = req.file.key;
        const publicUrl = `${process.env.CF_PUBLIC_URL}/${key}`;

        return res.status(200).json({
            status: 'success',
            url: publicUrl,
            key,
        });
    });
});

// POST /api/v1/upload/fetch-url
router.post('/fetch-url', flexAuth, fetchMediaUrl);

module.exports = router;
