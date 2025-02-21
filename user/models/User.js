const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: function() {
      // Username is not required during initial phone signup
      return !this.phone || this.isPhoneVerified;
    }
  },
  lastName: {
    type: String,
    required: function() {
      // Username is not required during initial phone signup
      return !this.phone || this.isPhoneVerified;
    }
  },
  email: {
    type: String,
    required: function() {
      // Email is not required for phone-only users
      return !this.phone && !this.isOAuthUser;
    },
    unique: true,
    sparse: true // Allows null/undefined values to exist
  },
  password: {
    type: String,
    required: function() {
      return !this.isOAuthUser && !this.phone;
    }
  },
  phone: {
    type: String,
    maxLength: 15,
    unique: true,
    sparse: true // Allows null/undefined values to exist
  },
  phoneOTP: {
    type: String,
    select: false // Don't include in normal queries
  },
  phoneOTPExpires: {
    type: Date,
    select: false // Don't include in normal queries
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  address: String,
  role: {
    type: String,
    enum: ['user', 'service_provider', 'seller'],
    required: true
  },
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  oAuthProvider: {
    type: String,
    enum: ['google', 'facebook', 'apple', 'phone', null],
    default: null
  },
  oAuthId: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, { timestamps: true });

// Add index for phone lookup during OTP verification
userSchema.index({ phone: 1, phoneOTP: 1, phoneOTPExpires: 1 });

module.exports = mongoose.model('User', userSchema); 