const express = require('express');
const { protect } = require('../controllers/authController');
const { generateImage } = require('../controllers/aiImageController');

const router = express.Router();

// POST /api/v1/ai/generate-image — protected, subscription users only
router.post('/generate-image', protect, generateImage);

module.exports = router;
