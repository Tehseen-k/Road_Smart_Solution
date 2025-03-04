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
const router = express.Router();
router.use('/user', userserviceSubCategoryRoutes);
router.use('/user', userserviceTypeRoutes);
router.use('/user', userserviceReminderRoutes);
router.use('/user', userserviceConfirmationRoutes);
router.use('/user', userserviceQouteRoutes);
router.use('/user', uservehicleSpecificPeoductRoutes);
router.use('/user', usercarForSaleRoutes);
router.use('/user', authRoutes);
router.use('/user-car', userCarRoutes);
router.use('/car-part', userCarPartRoutes);
router.use('/car-part-order', userCarPartOrderRoutes);
router.use('/user', userServiceCategoryRoutes);
router.use('/user', userServiceProductRoutes);
router.use('/user', userestimateRoutes);
router.use('/user', userCarSaleRoutes);
router.use('/user', userCarSellerRoutes);
router.use('/user', userInsuranceRoutes);
router.use('/user', userInsuranceClaimRoutes);
router.use('/user', userInsuranceDetailRoutes);
router.use('/user', userInsuranceEstimateRoutes);
router.use('/user', userrentalBookingRoutes);
router.use('/user', userrentalCarRoutes);
router.use('/user', userrentalProviderRoutes);
router.use('/user', userroadLicenseRoutes);
router.use('/user', userserviceProviderRoutes);
router.use('/user', userserviceRequestRoutes);
module.exports = router;