const express = require('express');
const authRoutes = require('./user.route');
const userCarRoutes = require('./userCar.route');
const router = express.Router();
router.use('/user', authRoutes);
router.use('/user-car', userCarRoutes);
module.exports = router;