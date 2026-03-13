const express = require('express');
const twitterController = require('../controllers/twitterController');
const authController = require('../controllers/authController');
const adminAuth = require('../middlewares/authMiddleware');

const router = express.Router();

// Public/User routes
router.get('/', twitterController.getAllPosts);
router.post('/activate/:id', authController.protect, twitterController.activatePost);

// Admin routes
router.use(adminAuth.protect);
router.use(adminAuth.restrictToAdmin);

router.post('/', twitterController.createPost);
router.patch('/:id', twitterController.updatePost);
router.delete('/:id', twitterController.deletePost);

module.exports = router;
