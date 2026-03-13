const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route - Admin login
router.post('/login', adminController.adminLogin);

// TEMPORARY: Public route to create first admin (remove after creating admin)
router.post('/create', adminController.createAdmin);

// Protected admin routes - require authentication + admin role
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictToAdmin);

// Get all users
router.get('/users', adminController.getAllUsers);

// Get single user
router.get('/users/:id', adminController.getUser);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

// Get all admins
router.get('/admins', adminController.getAllAdmins);

// Delete admin
router.delete('/admins/:id', adminController.deleteAdmin);

// Get all videos
router.get('/videos', adminController.getAllVideos);

// Toggle video publish status
router.patch('/videos/:id/toggle-publish', adminController.toggleVideoPublish);

// Get admin dashboard stats
router.get('/dashboard-stats', adminController.getDashboardStats);

module.exports = router;
