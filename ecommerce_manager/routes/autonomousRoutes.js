const express = require('express');
const router = express.Router();
const autonomousController = require('../controllers/autonomousController');
// Assume path to your standard auth middleware
const { protect } = require('../../../controllers/authController'); 

// ──────────────────────────────────────────────────────────────
//  AI SIGNALS (The Senses)
// ──────────────────────────────────────────────────────────────
router.get('/signals/:storeId', protect, autonomousController.getSignals);

// ──────────────────────────────────────────────────────────────
//  AI AGENT ACTIVITY (The Actions)
// ──────────────────────────────────────────────────────────────
router.get('/tasks/:storeId', protect, autonomousController.getAgentTasks);
router.patch('/tasks/:taskId/approve', protect, autonomousController.approveTask);

// ──────────────────────────────────────────────────────────────
//  AI ANALYTICS (The Insights)
// ──────────────────────────────────────────────────────────────
router.get('/health/:storeId', protect, autonomousController.getStoreHealth);

// ──────────────────────────────────────────────────────────────
//  AI CONTROL (The Brain)
// ──────────────────────────────────────────────────────────────
router.post('/audit/:storeId', protect, autonomousController.triggerAudit);

// ──────────────────────────────────────────────────────────────
//  PLATFORM WEBHOOKS (Incoming Events)
// ──────────────────────────────────────────────────────────────
const webhookController = require('../controllers/webhookController');
router.post('/webhooks/shopify', webhookController.handleShopifyWebhook);

module.exports = router;
