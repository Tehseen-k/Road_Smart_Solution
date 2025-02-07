const express = require('express');
const authRoutes = require('./user.route');
const router = express.Router();
router.use('/user', authRoutes);
module.exports = router;