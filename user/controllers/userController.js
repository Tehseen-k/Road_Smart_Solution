const User = require('../models/User');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {sendEmail} = require('../../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const userController = {
  // Create new user
  createUser: catchAsync(async (req, res) => {
    const { email, password, firstName, lastName, phone, role } = req.body;
    
    if (!email || !password || !role) {
      throw new ApiError(400, 'Email, password, and role are required');
    }

    if (!validationHelper.isValidEmail(email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    if (!validationHelper.isStrongPassword(password)) {
      throw new ApiError(400, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    if (phone && !validationHelper.isValidPhone(phone)) {
      throw new ApiError(400, 'Invalid phone number format');
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: phone },
    
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new ApiError(400, 'Email already registered');
      }
      if (existingUser.phone === phone) {
        throw new ApiError(400, 'Phone number already registered');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'user',
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
      isPhoneVerified: false
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    try {
      const emailData = {
        email: email,
        name: firstName + ' ' + lastName,
        otp: emailVerificationToken
      };

      await sendEmail('verification', emailData);
    } catch (error) {
      console.error('Verification email failed to send:', error);
    }

    // if (phone) {
    //   try {
    //     await sendPhoneVerification(phone);
    //   } catch (error) {
    //     console.error('Phone verification failed to initiate:', error);
    //   }
    // }

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpires;

    const response = new ResponseHandler(res);
    return response.created({
      user: userResponse,
      token,
      message: 'Registration successful! Please check your email for verification.'
    });
  }),

  // Get all users with pagination
  getAllUsers: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    const users = await User.find(query)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      users,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get user by ID
  getUserById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const response = new ResponseHandler(res);
    return response.success(user);
  }),

  // Update user
  updateUser: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    if (req.body.email && !validationHelper.isValidEmail(req.body.email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    if (req.body.phone && !validationHelper.isValidPhone(req.body.phone)) {
      throw new ApiError(400, 'Invalid phone number format');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const response = new ResponseHandler(res);
    return response.success(user, 'User updated successfully');
  }),

  // Delete user
  deleteUser: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const response = new ResponseHandler(res);
    return response.success(null, 'User deleted successfully');
  }),

  // Search users
  searchUsers: catchAsync(async (req, res) => {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [
        { username: searchRegex },
        { email: searchRegex }
      ]
    });

    const response = new ResponseHandler(res);
    return response.success(users);
  }),

  // Get users by role
  getUsersByRole: catchAsync(async (req, res) => {
    const { role } = req.params;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const users = await User.find({ role })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role });

    const response = new ResponseHandler(res);
    return response.success({
      users,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Email & Password Login
  loginWithEmail: catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    const response = new ResponseHandler(res);
    return response.success({ user, token });
  }),

  // Phone Login
  loginWithPhone: catchAsync(async (req, res) => {
    const { phone, verificationCode } = req.body;

    if (!phone || !verificationCode) {
      throw new ApiError(400, 'Phone and verification code are required');
    }

    // Verify OTP code here (implement your OTP verification logic)
    const isValidOTP = await verifyOTP(phone, verificationCode);
    if (!isValidOTP) {
      throw new ApiError(401, 'Invalid verification code');
    }

    let user = await User.findOne({ phone });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    const response = new ResponseHandler(res);
    return response.success({ user, token });
  }),

  // Google Sign In
  googleSignIn: catchAsync(async (req, res) => {
    const { idToken } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        username: name,
        isOAuthUser: true,
        oAuthProvider: 'google',
        oAuthId: googleId,
        role: 'user',
        isEmailVerified: true
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    const response = new ResponseHandler(res);
    return response.success({ user, token });
  }),

  // Facebook Sign In
  facebookSignIn: catchAsync(async (req, res) => {
    const { accessToken } = req.body;
    
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );

    const { email, name, id: facebookId } = fbResponse.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        username: name,
        isOAuthUser: true,
        oAuthProvider: 'facebook',
        oAuthId: facebookId,
        role: 'user',
        isEmailVerified: true
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    const response = new ResponseHandler(res);
    return response.success({ user, token });
  }),

  // Apple Sign In
  appleSignIn: catchAsync(async (req, res) => {
    // Implement Apple Sign In verification
    const { idToken, user: appleUser } = req.body;
    
    // Verify the token with Apple's public key
    // Implementation depends on apple-auth package or similar
    
    let user = await User.findOne({ oAuthId: appleUser.id });
    if (!user) {
      user = await User.create({
        email: appleUser.email,
        username: appleUser.name,
        isOAuthUser: true,
        oAuthProvider: 'apple',
        oAuthId: appleUser.id,
        role: 'user',
        isEmailVerified: true
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    const response = new ResponseHandler(res);
    return response.success({ user, token });
  }),

  // Send Email Verification
  sendVerificationEmail: catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const verificationToken = crypto.randomBytes(6).toString('hex'); // 6-digit OTP
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    try {
      const emailData = {
        email: user.email,
        name: user.username,
        otp: verificationToken
      };

      await sendEmail('verification', emailData);

      const response = new ResponseHandler(res);
      return response.success(null, 'Verification email sent');
    } catch (error) {
      throw new ApiError(500, 'Error sending verification email');
    }
  }),

  // Verify Email
  verifyEmail: catchAsync(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const response = new ResponseHandler(res);
    return response.success(null, 'Email verified successfully');
  }),

  // Forgot Password
  forgotPassword: catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const resetToken = crypto.randomBytes(6).toString('hex'); // 6-digit OTP
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      const emailData = {
        email: user.email,
        name: user.username,
        otp: resetToken
      };

      await sendEmail('reset', emailData);

      const response = new ResponseHandler(res);
      return response.success(null, 'Password reset OTP sent');
    } catch (error) {
      throw new ApiError(500, 'Error sending reset email');
    }
  }),

  // Reset Password
  resetPassword: catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const response = new ResponseHandler(res);
    return response.success(null, 'Password reset successful');
  }),

  // Send Phone OTP
  sendPhoneOTP: catchAsync(async (req, res) => {
    const { phone } = req.body;

    if (!phone || !validationHelper.isValidPhone(phone)) {
      throw new ApiError(400, 'Valid phone number is required');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      // First time user - create temporary account
      user = new User({
        phone,
        phoneOTP: otp,
        phoneOTPExpires: otpExpires,
        isPhoneVerified: false,
        username: `user_${phone.slice(-4)}`, // Temporary username
        role: 'user'
      });
    } else {
      // Existing user - update OTP
      user.phoneOTP = otp;
      user.phoneOTPExpires = otpExpires;
    }

    await user.save();

    // TODO: Integrate with SMS service
    console.log(`OTP for ${phone}: ${otp}`); // For development

    const response = new ResponseHandler(res);
    return response.success(null, 'OTP sent successfully');
  }),

  // Verify Phone OTP
  verifyPhoneOTP: catchAsync(async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      throw new ApiError(400, 'Phone and OTP are required');
    }

    const user = await User.findOne({
      phone,
      phoneOTP: otp,
      phoneOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    // Mark phone as verified
    user.isPhoneVerified = true;
    user.phoneOTP = undefined;
    user.phoneOTPExpires = undefined;

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    const response = new ResponseHandler(res);
    return response.success({ 
      user,
      token,
      isNewUser: !user.username || user.username.startsWith('user_')
    });
  }),

  // Complete Phone Registration
  completePhoneRegistration: catchAsync(async (req, res) => {
    const { phone, username, email } = req.body;

    if (!phone || !username) {
      throw new ApiError(400, 'Phone and username are required');
    }

    const user = await User.findOne({ phone });
    if (!user || !user.isPhoneVerified) {
      throw new ApiError(400, 'Phone number not verified');
    }

    // Validate email if provided
    if (email && !validationHelper.isValidEmail(email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    // Check username availability
    const existingUsername = await User.findOne({ username });
    if (existingUsername && existingUsername.phone !== phone) {
      throw new ApiError(400, 'Username already taken');
    }

    // Update user details
    user.username = username;
    if (email) {
      user.email = email.toLowerCase();
    }

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    const response = new ResponseHandler(res);
    return response.success({ user, token });
  })
};

module.exports = userController; 