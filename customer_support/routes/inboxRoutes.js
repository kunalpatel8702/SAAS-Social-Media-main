const express = require('express');
const router = express.Router();
const { protect } = require('../../../middlewares/authMiddleware');
const inboxController = require('../controllers/inboxController');

router.use(protect); // Ensure admin only

router.get('/sessions', inboxController.getAllSessions);
router.get('/sessions/:sessionId/messages', inboxController.getSessionMessages);
router.post('/sessions/:sessionId/message', inboxController.sendHumanMessage);

router.get('/tickets', inboxController.getAllTickets);

module.exports = router;
