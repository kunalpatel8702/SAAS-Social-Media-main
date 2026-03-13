const express = require('express');
const linkedinController = require('./linkedinController');
const authController = require('../../controllers/authController');

const router = express.Router();

// Public callback for LinkedIn redirect
router.get('/callback', linkedinController.handleCallback);

// All other routes are protected
router.use(authController.protect);

router.get('/auth-url', linkedinController.getAuthUrl);
router.get('/accounts', linkedinController.getConnectedAccounts);

router.post('/schedule', linkedinController.schedulePost);
router.get('/posts', linkedinController.getPosts);

module.exports = router;
