
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const db = require('../../config/db');

const { Schema } = mongoose;

const userSchema = new Schema({

    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    fcmToken: { type: String },
    otp: { type: String },
    otpCreatedAt: { type: Date, default: null }
}, { versionKey: false });

userSchema.pre('save', async function () {
    var user = this;
    const salt = await (bcrypt.genSalt(10));
    const hashPass = await bcrypt.hash(user.password, salt);
    user.password = hashPass;
    try {

    } catch (err) {
        throw err;
    }
});

userSchema.methods.comparePassword = async function (newPassword) {
    try {
        const isMatch = await bcrypt.compare(newPassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
};



const UserModel = mongoose.model('Users', userSchema);



module.exports = UserModel;