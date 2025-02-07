const express = require('express');
const router = express.Router();
const { register, signin, verifyOtp, resendOtp, forgotPassword, changePassword, logout, imageUpload } = require('../controller/user.controller');

// Middleware for file upload
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Routes
router.post('/register', register);
router.post('/signIn', signin);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.post('/upload-image', upload.single('image'), imageUpload);

module.exports = router;
