const express = require('express');
const authRoutes = require('./user.route');
const userCarRoutes = require('./userCar.route');
const userCarPartRoutes = require('./carPart.route');
const userCarPartOrderRoutes = require('./carPartOrder.route');
const userServiceCategoryRoutes = require('./serviceCategory.route');
const userServiceProductRoutes = require('./serviceProduct.route');
const userCarSaleRoutes = require('./carSale.route');
const userCarSellerRoutes = require('./carSeller.route');
const userestimateRoutes = require('./estimate.route');
const userInsuranceRoutes = require('./insurance.route');
const userInsuranceClaimRoutes = require('./insuranceClaim.route');
const userInsuranceDetailRoutes = require('./insuranceDetail.route');
const userInsuranceEstimateRoutes = require('./insuranceEstimate.route');
const userrentalBookingRoutes = require('./rentalBooking.route');
const userrentalCarRoutes = require('./rentalCar.route');
const userrentalProviderRoutes = require('./rentalProvider.route');
const userroadLicenseRoutes = require('./roadLicense.route');
const userserviceProviderRoutes = require('./serviceProvider.route');
const userserviceRequestRoutes = require('./serviceRequest.route');
const userserviceTypeRoutes = require('./serviceType.route');
const userserviceReminderRoutes = require('./serviceReminder.route');
const userserviceConfirmationRoutes = require('./serviceConfirmation.route');
const userserviceQouteRoutes = require('./serviceQoute.route');
const uservehicleSpecificPeoductRoutes = require('./vehicleSpecificPeoduct.route');
const usercarForSaleRoutes = require('./carForSale.route');
const userserviceSubCategoryRoutes = require('./serviceSubCategory.route');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
var userString = "/user";

// Public routes (no authentication required)
router.use(userString, authRoutes);

// Protected routes (authentication required)
router.use(userString, authMiddleware, userserviceSubCategoryRoutes);
router.use(userString, authMiddleware, userserviceTypeRoutes);
router.use(userString, authMiddleware, userserviceReminderRoutes);
router.use(userString, authMiddleware, userserviceConfirmationRoutes);
router.use(userString, authMiddleware, userserviceQouteRoutes);
router.use(userString, authMiddleware, uservehicleSpecificPeoductRoutes);
router.use(userString, authMiddleware, usercarForSaleRoutes);
router.use('/user-car', authMiddleware, userCarRoutes);
router.use('/car-part', authMiddleware, userCarPartRoutes);
router.use('/car-part-order', authMiddleware, userCarPartOrderRoutes);
router.use(userString, authMiddleware, userServiceCategoryRoutes);
router.use(userString, authMiddleware, userServiceProductRoutes);
router.use(userString, authMiddleware, userestimateRoutes);
router.use(userString, authMiddleware, userCarSaleRoutes);
router.use(userString, authMiddleware, userCarSellerRoutes);
router.use(userString, authMiddleware, userInsuranceRoutes);
router.use(userString, authMiddleware, userInsuranceClaimRoutes);
router.use(userString, authMiddleware, userInsuranceDetailRoutes);
router.use(userString, authMiddleware, userInsuranceEstimateRoutes);
router.use(userString, authMiddleware, userrentalBookingRoutes);
router.use(userString, authMiddleware, userrentalCarRoutes);
router.use(userString, authMiddleware, userrentalProviderRoutes);
router.use(userString, authMiddleware, userroadLicenseRoutes);
router.use(userString, authMiddleware, userserviceProviderRoutes);
router.use(userString, authMiddleware, userserviceRequestRoutes);

module.exports = router;