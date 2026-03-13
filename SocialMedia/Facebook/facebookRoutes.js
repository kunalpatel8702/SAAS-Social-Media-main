const express = require('express');
const facebookController = require('./facebookController');
const authController = require('../../controllers/authController');

const router = express.Router();

// All routes here are protected
// Public callback for Facebook redirect
router.get('/callback', facebookController.handleCallback);

// All other routes are protected
router.use(authController.protect);

router.get('/auth-url', facebookController.getAuthUrl);
router.get('/accounts', facebookController.getConnectedAccounts);

router.post('/schedule', facebookController.schedulePost);
router.post('/post-now', facebookController.postNow);
router.get('/posts', facebookController.getPosts);
router.delete('/posts/:id', facebookController.deletePost);
router.patch('/posts/:id', facebookController.reschedulePost);

module.exports = router;
