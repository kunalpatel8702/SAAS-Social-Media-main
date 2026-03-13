const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const scraperController = require('../controllers/scraperController');

// All scraper routes require authentication
router.use(protect);

router.get('/quota', scraperController.getQuota);
router.post('/jobs', scraperController.createScrapeJob);

module.exports = router;
