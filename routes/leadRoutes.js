const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const leadController = require('../controllers/leadController');

// All lead routes require authentication
router.use(protect);

router.post('/', leadController.createLead);
router.post('/bulk', leadController.createManyLeads);
router.post('/score-all', leadController.scoreAllLeads);
router.post('/:id/score', leadController.scoreSingleLead);
router.get('/', leadController.getLeads);
router.patch('/:id/status', leadController.updateLeadStatus);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.softDeleteLead);

module.exports = router;
