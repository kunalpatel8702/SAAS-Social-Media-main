const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { protect } = require('../controllers/authController');

// Get all dashboard stats (Protected)
router.get('/stats', protect, getDashboardStats);

module.exports = router;
