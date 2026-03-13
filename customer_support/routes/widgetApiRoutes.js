const express = require('express');
const router = express.Router();
const { startSession, sendMessage } = require('../controllers/widgetApiController');

router.post('/session/start', startSession);
router.post('/chat', sendMessage);

module.exports = router;
