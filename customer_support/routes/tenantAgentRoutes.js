const express = require('express');
const router = express.Router();
const { createTicket, getAnalytics } = require('../controllers/tenantAgentController');

// All endpoints here should ideally be protected by an auth middleware (e.g. requireAuth, checkRole)
// For Step 5 we implement the endpoint logic specifically.

router.post('/create', createTicket);
router.get('/analytics', getAnalytics); // Added in Step 7

module.exports = router;
