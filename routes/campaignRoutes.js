const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const campaignController = require('../controllers/campaignController');

// All campaign routes require authentication
router.use(protect);

router.post('/', campaignController.createCampaign);
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignDetails);
router.post('/:id/start', campaignController.startCampaign);
router.patch('/:id/status', campaignController.updateCampaignStatus);
router.delete('/:id', campaignController.softDeleteCampaign);

module.exports = router;
