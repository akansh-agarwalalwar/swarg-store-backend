const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/request-password-reset', adminController.requestPasswordReset);
router.post('/verify-otp', adminController.verifyOtp);
router.post('/reset-password', adminController.resetPassword);

module.exports = router; 