const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

console.log('authController.signup type:', typeof authController.signup);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Example of a protected route
router.get('/me', authController.protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
});

module.exports = router;
