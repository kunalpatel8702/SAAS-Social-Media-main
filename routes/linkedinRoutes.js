const express = require('express');
const linkedinController = require('../controllers/linkedinController');
const authController = require('../controllers/authController');
const adminAuth = require('../middlewares/authMiddleware');

const router = express.Router();

// Public/User routes
router.get('/', linkedinController.getAllPosts);
router.post('/activate/:id', authController.protect, linkedinController.activatePost);

// Admin routes
router.use(adminAuth.protect);
router.use(adminAuth.restrictToAdmin);

router.post('/', linkedinController.createPost);
router.patch('/:id', linkedinController.updatePost);
router.delete('/:id', linkedinController.deletePost);

module.exports = router;
