const express = require('express');
const router = express.Router();
const { uploadTextKnowledge, scrapeUrlKnowledge } = require('../controllers/knowledgeController');

// In a real app, these should pass through authMiddleware
router.post('/upload-text', uploadTextKnowledge);
router.post('/scrape-url', scrapeUrlKnowledge);

module.exports = router;
