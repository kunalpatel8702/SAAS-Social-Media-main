const express = require('express');
const router = express.Router();
const { analyzeFeedback, generateFaq, draftResponse } = require('../controllers/powerupController');

// All endpoints here should ideally be protected by auth middleware (requireAuth).
// This blueprint builds the functional endpoints.

router.post('/analyze-feedback', analyzeFeedback);
router.post('/generate-faq', generateFaq);
router.post('/draft-response', draftResponse);

module.exports = router;
