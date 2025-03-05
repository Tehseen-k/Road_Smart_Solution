const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *           maxLength: 15
 *         isPhoneVerified:
 *           type: boolean
 *         isEmailVerified:
 *           type: boolean
 *         address:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, service_provider, seller]
 *         isOAuthUser:
 *           type: boolean
 *         oAuthProvider:
 *           type: string
 *           enum: [google, facebook, apple, phone, null]
 */

/**
 * @swagger
 * /user/register/email:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new user with email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, service_provider, seller]
 *               phone:
 *                 type: string
 *                 maxLength: 15
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/register/email', userController.createUser);

/**
 * @swagger
 * /user/login/email:
 *   post:
 *     tags: [Authentication]
 *     summary: Login with email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/email', userController.loginWithEmail);

/**
 * @swagger
 * /user/login/phone/send-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Send OTP for phone login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 maxLength: 15
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/login/phone/send-otp', userController.sendPhoneOTP);

/**
 * @swagger
 * /user/login/phone/verify:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify phone OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/login/phone/verify', userController.verifyPhoneOTP);

// /**
//  * @swagger
//  * /user/login/google:
//  *   post:
//  *     tags: [Authentication]
//  *     summary: Login with Google
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - idToken
//  *             properties:
//  *               idToken:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Login successful
//  */
// router.post('/login/google', userController.googleSignIn);

/**
 * @swagger
 * /user/verify-email/{token}:
 *   get:
 *     tags: [Email Verification]
 *     summary: Verify email address
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 */
router.get('/verify-email/:token', userController.verifyEmail);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     tags: [Password Management]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset instructions sent
 */
router.post('/forgot-password', userController.forgotPassword);

/**
 * @swagger
 * /user/users:
 *   get:
 *     tags: [User Management]
 *     summary: Get all users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/users', userController.getAllUsers);

/**
 * @swagger
 * /user/users/{id}:
 *   get:
 *     tags: [User Management]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   patch:
 *     tags: [User Management]
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.get('/users/:id', userController.getUserById);
router.patch('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

/**
 * @swagger
 * /user/by-role/{role}:
 *   get:
 *     tags: [User Management]
 *     summary: Get users by role
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, service_provider, seller]
 *     responses:
 *       200:
 *         description: List of users with specified role
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/by-role/:role', userController.getUsersByRole);

/**
 * @swagger
 * /user/send-verification:
 *   post:
 *     tags: [Email Verification]
 *     summary: Send verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       404:
 *         description: User not found
 */
router.post('/send-verification', userController.sendVerificationEmail);

/**
 * @swagger
 * /user/reset-password/{token}:
 *   post:
 *     tags: [Password Management]
 *     summary: Reset password using token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password/:token', userController.resetPassword);

// /**
//  * @swagger
//  * /user/login/facebook:
//  *   post:
//  *     tags: [Authentication]
//  *     summary: Login with Facebook
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - accessToken
//  *             properties:
//  *               accessToken:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Login successful
//  */
// router.post('/login/facebook', userController.facebookSignIn);

// /**
//  * @swagger
//  * /user/login/apple:
//  *   post:
//  *     tags: [Authentication]
//  *     summary: Login with Apple
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - idToken
//  *               - user
//  *             properties:
//  *               idToken:
//  *                 type: string
//  *               user:
//  *                 type: object
//  *     responses:
//  *       200:
//  *         description: Login successful
//  */
// router.post('/login/apple', userController.appleSignIn);

/**
 * @swagger
 * /user/complete-phone-registration:
 *   post:
 *     tags: [Authentication]
 *     summary: Complete registration for phone users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - username
 *             properties:
 *               phone:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Registration completed successfully
 */
router.post('/complete-phone-registration', userController.completePhoneRegistration);

module.exports = router;