const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/me', authenticate, authController.updateCurrentUser);
router.put('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;