const User = require('../model/user.model');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { sendEmail } = require('../../utils/sendEmail');
const randomstring = require('randomstring');
const mongoose = require('mongoose');
// const { uploadedImgPath } = require('../');
const moment = require('moment');

exports.signin = async (req, res, next) => {
    try {
        let { email, password, fcmToken } = req.body;

        // Validate email and password
        if (!email || !password) {
            return res.status(400).send({
                status: 0,
                message: 'Email and password are required',
            });
        }

        // Normalize email
        email = email.toLowerCase().trim();

        // Configure passport local strategy
        passport.use(
            new localStrategy({ usernameField: 'email' }, async (username, password, done) => {
                try {
                    const user = await User.findOne({ email: username });
                    
                    // Check if user exists
                    if (!user) {
                        return done(null, false, {
                            status: 0,
                            message: 'User does not exist!',
                        });
                    }

                    // Verify password
                    console.log(`user password: ${user.password} | actual pass: ${password}`);
                    const isMatch = await user.comparePassword(password);

                    if (!isMatch) {
                        return done(null, false, {
                            status: 0,
                            message: 'Incorrect password',
                        });
                    }

                    // Return user if authenticated
                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            })
        );

        // Authenticate user with passport
        passport.authenticate('local', async (err, user, info) => {
            if (err) {
                console.error(err, 'signin');
                return res.status(500).send({
                    status: 0,
                    message: 'An error occurred during authentication',
                });
            }

            if (user) {
                // Update FCM token
                if (fcmToken) {
                    await user.updateOne({ fcmToken });
                }

                // Prepare user data
                const data = {
                    userId: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    profileImage: user.profileImage,
                };

                return res.status(200).send({
                    status: 1,
                    message: 'You have logged in successfully',
                    data,
                });
            } else {
                return res.status(401).send({
                    status: 0,
                    message: info.message || 'Unauthorized',
                });
            }
        })(req, res);
    } catch (error) {
        console.error(error, 'signin');
        return next(error);
    }
};


exports.register = async (req, res, next) => {
    try {
        let { fullName, email, password, fcmToken, profileImage } = req.body;

        // Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).send({
                status: 0,
                message: `Parameters missing: ${!fullName ? 'FullName' : ''} ${!email ? 'Email' : ''} ${!password ? 'Password' : ''}`,
            });
        }

        // Normalize email
        email = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ status: 0, message: 'User already exists' });
        }

        // Create new user
        const otp = randomstring.generate({ length: 6, charset: 'numeric' });
        const user = await User.create({
            fullName,
            email,
            password,
            fcmToken,
            profileImage,
            otp,
            otpCreatedAt: new Date(),
        });

        // Send OTP email
        const emailData = {
            email: user.email,
            name: user.fullName,
            otp,
        };
        await sendEmail('verify-user-otp', emailData);

        // Response data
        const data = {
            userId: user.id,
            fullName: user.fullName,
            email: user.email,
            profileImage: user.profileImage,
        };

        return res.status(201).send({
            status: 1,
            message: 'User registered successfully! Check your email for the OTP code.',
            data,
        });
    } catch (error) {
        console.error(error, 'auth/signup');
        next(error);
    }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const { userId, otp } = req.body;

        // Validate input
        if (!userId || !otp) {
            return res.status(400).send({ status: 0, message: 'Missing required parameters' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ status: 0, message: 'User not found' });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).send({ status: 0, message: 'Invalid OTP' });
        }

        // Check OTP expiration (5 minutes)
        const otpExpiryTime = moment(user.otpCreatedAt).add(5, 'minutes');
        if (moment().isAfter(otpExpiryTime)) {
            return res.status(400).send({ status: 0, message: 'OTP expired' });
        }

        // Clear OTP after successful validation
        user.otp = null;
        user.otpCreatedAt = null;
        await user.save();

        return res.status(200).send({ status: 1, message: 'OTP validated successfully' });
    } catch (error) {
        return next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { userId } = req.body;

        // Validate input
        if (!userId) {
            return res.status(400).send({ status: 0, message: 'Missing user ID' });
        }

        // Find the user and remove the fcmToken (or any other token-related data)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ status: 0, message: 'User not found' });
        }

        // Clear fcmToken (for push notifications) and any other tokens if you use JWT, etc.
        user.fcmToken = null;
        await user.save();

        return res.status(200).send({ status: 1, message: 'Logged out successfully' });
    } catch (error) {
        return next(error);
    }
};


// API to upload image
exports.imageUpload = async (req, res, next) => {
    try {
        const image = req.file ? `${req.file.filename}` : '';
        if (image) {
            return res.status(200).send({
                status: 1,
                message: 'Image upload successfully',
                imageURL: "uploadedImgPath" + image,
            });
        } else
            return res
                .status(200)
                .send({ status: 0, message: 'Please upload the image' });
    } catch (error) {
        next(error);
    }
};

exports.resendOtp = async (req, res, next) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).send({ status: 0, message: 'User not found' });
        }

        const otp = randomstring.generate({ length: 6, charset: 'numeric' });
        user.otp = otp;
        user.otpCreatedAt = new Date();
        await user.save();

        // Send OTP email
        const emailData = {
            email: user.email,
            name: user.fullName,
            otp,
        };
        await sendEmail('verify-user-otp', emailData);

        return res.status(200).send({
            status: 1,
            message: 'Otp sent. Kindly check your email for the code',
            data: { otp },
        });
    } catch (error) {
        return next(error);
    }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({ status: 0, message: 'Please enter email' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).send({ status: 0, message: 'User not found' });
        }

        const otp = randomstring.generate({ length: 6, charset: 'numeric' });
        user.otp = otp;
        user.otpCreatedAt = new Date();
        await user.save();

        // Send OTP email for password reset
        const emailData = {
            email: user.email,
            name: user.fullName,
            otp,
        };
        await sendEmail('verify-user-otp', emailData);

        return res.status(200).send({
            status: 1,
            message: 'OTP sent successfully. Check your email.',
            data: { otp },
        });
    } catch (error) {
        return next(error);
    }
};

// Change Password
exports.changePassword = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        // Validate required fields
        if (!email || !oldPassword || !newPassword) {
            return res.status(400).send({
                status: 0,
                message: 'Please provide all the required fields (email, oldPassword, newPassword)',
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).send({
                status: 0,
                message: 'User not found',
            });
        }

        // Check old password if provided
        if (oldPassword) {
            const isMatch = await user.comparePassword(oldPassword);
            if (!isMatch) {
                return res.status(400).send({
                    status: 0,
                    message: 'Incorrect old password',
                });
            }
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return res.status(200).send({
            status: 1,
            message: 'Password updated successfully',
        });
    } catch (error) {
        return next(error);
    }
};