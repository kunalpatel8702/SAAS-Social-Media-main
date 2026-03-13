const express = require('express');
const instagramController = require('./instagramController');
const authController = require('../../controllers/authController');

const router = express.Router();

// All routes here are protected
// Public callback for Instagram/Facebook redirect
router.get('/callback', instagramController.handleCallback);

// All other routes are protected
router.use(authController.protect);

router.get('/auth-url', instagramController.getAuthUrl);
router.get('/accounts', instagramController.getConnectedAccounts);

router.post('/schedule', instagramController.schedulePost);
router.post('/post-now', instagramController.postNow);
router.get('/posts', instagramController.getPosts);
router.delete('/posts/:id', instagramController.deletePost);
router.patch('/posts/:id', instagramController.reschedulePost);

module.exports = router;
