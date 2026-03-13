const express = require('express');
const automationController = require('../controllers/automationController');
const { protect: protectUser } = require('../controllers/authController');
const { protect: protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', automationController.getAllServices);
router.get('/:id', automationController.getService);

// User protected routes
router.post('/subscribe/:id', protectUser, automationController.subscribeToService);
router.get('/my/subscriptions', protectUser, automationController.getMySubscriptions);

// Admin protected routes
router.post('/', protectAdmin, automationController.createService);
router.patch('/:id', protectAdmin, automationController.updateService);
router.delete('/:id', protectAdmin, automationController.deleteService);

// Admin utility: one-time cleanup of duplicate subscriptions in DB
router.post('/admin/cleanup-duplicates', protectAdmin, automationController.cleanupDuplicateSubscriptions);

module.exports = router;

