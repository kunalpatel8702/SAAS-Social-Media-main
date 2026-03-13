const express = require('express');
const instagramController = require('../controllers/instagramController');
const authController = require('../controllers/authController');
const adminAuth = require('../middlewares/authMiddleware');

const router = express.Router();

// Public/User routes
router.get('/', instagramController.getAllPosts);
router.post('/activate/:id', authController.protect, instagramController.activatePost);

// Admin routes
router.use(adminAuth.protect);
router.use(adminAuth.restrictToAdmin);

router.post('/', instagramController.createPost);
router.patch('/:id', instagramController.updatePost);
router.delete('/:id', instagramController.deletePost);

module.exports = router;
