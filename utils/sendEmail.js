const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER ?? "itehseenk@gmail.com", // Your email address from .env
        pass: process.env.EMAIL_PASS ?? "euimvtpfdeagzgzy", // Your email password from .env
    },
});

exports.sendEmail = async (template, data) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address from .env
            to: data.email, // Recipient email address
            subject: 'OTP Verification',
            text: `Hello ${data.name},\n\nYour OTP code is: ${data.otp}\n\nThank you!`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};
