const express = require('express');
const twitterController = require('./twitterController');
const authController = require('../../controllers/authController');

const router = express.Router();

// Public callback for Twitter redirect
router.get('/callback', twitterController.handleCallback);

// All other routes are protected
router.use(authController.protect);

router.get('/auth-url', twitterController.getAuthUrl);
router.get('/accounts', twitterController.getConnectedAccounts);

router.post('/schedule', twitterController.schedulePost);
router.get('/posts', twitterController.getPosts);

module.exports = router;
