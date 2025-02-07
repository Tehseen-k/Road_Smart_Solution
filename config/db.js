const mongoose = require('mongoose');
require('dotenv').config();
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://zikar:zikar@zikarcluster.ztfth.mongodb.net/?retryWrites=true&w=majority&appName=ZikarCluster';

const connectDB = async () => {
    try {
        console.log('hereeeeeeee');
        await mongoose.connect(dbURI, {

        });
        console.log('MongoDB is connected');
    } catch (err) {
        console.error('Error occurred while connecting to MongoDB', err);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;

