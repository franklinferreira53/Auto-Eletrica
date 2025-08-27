const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rotas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/verify-email/:verificationToken', verifyEmail);

// Rotas protegidas
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;