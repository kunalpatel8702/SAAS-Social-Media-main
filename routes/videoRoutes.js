const express = require('express');
const { protect } = require('../controllers/authController');
const { generateVideo, getVideoStatus, getUserVideos, getVoiceOptions, downloadVideo, getPublicVideos } = require('../controllers/videoController');

const router = express.Router();

// Public route to showcase generated videos
router.get('/public', getPublicVideos);

// Protected routes - only logged in users can generate videos
router.post('/generate', protect, generateVideo);
router.get('/status/:renderId', protect, getVideoStatus);
router.get('/my-videos', protect, getUserVideos);
router.get('/voices', protect, getVoiceOptions);
router.get('/download/:videoId', protect, downloadVideo);


module.exports = router;
