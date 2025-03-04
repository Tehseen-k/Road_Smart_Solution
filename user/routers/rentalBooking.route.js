const express = require('express');
const router = express.Router();
const rentalBookingController = require('../controllers/rentalBookingController');

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new rental booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               carId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               totalAmount:
 *                 type: number
 *               status:
 *                 type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid input or unavailable car
 *       500:
 *         description: Internal server error
 */
router.post('/bookings', rentalBookingController.createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all rental bookings
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by booking start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by booking end date
 *     responses:
 *       200:
 *         description: A list of rental bookings
 *       500:
 *         description: Internal server error
 */
router.get('/bookings', rentalBookingController.getAllBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a rental booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental booking ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rental booking details
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.get('/bookings/:id', rentalBookingController.getBookingById);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update the status of a rental booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental booking ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, active, completed, cancelled]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       400:
 *         description: Invalid status or transition
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.patch('/bookings/:id/status', rentalBookingController.updateBookingStatus);

/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Get all bookings for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of bookings for the specified user
 *       404:
 *         description: No bookings found for the user
 *       500:
 *         description: Internal server error
 */
router.get('/bookings/user/:userId', rentalBookingController.getUserBookings);

/**
 * @swagger
 * /bookings/provider/{providerId}:
 *   get:
 *     summary: Get all bookings for a specific provider
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The provider ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of bookings for the specified provider
 *       404:
 *         description: No bookings found for the provider
 *       500:
 *         description: Internal server error
 */
router.get('/bookings/provider/:providerId', rentalBookingController.getProviderBookings);

/**
 * @swagger
 * /bookings/stats:
 *   get:
 *     summary: Get booking statistics
 *     responses:
 *       200:
 *         description: Booking statistics
 *       500:
 *         description: Internal server error
 */
router.get('/bookings/stats', rentalBookingController.getBookingStats);

module.exports = router;





// const express = require('express');
// const router = express.Router();
// const rentalBookingController = require('../controllers/rentalBookingController');

// /**
//  * @swagger
//  * /bookings:
//  *   post:
//  *     summary: Create a new rental booking
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userId:
//  *                 type: string
//  *               carId:
//  *                 type: string
//  *               startDate:
//  *                 type: string
//  *                 format: date
//  *               endDate:
//  *                 type: string
//  *                 format: date
//  *               totalAmount:
//  *                 type: number
//  *               status:
//  *                 type: string
//  *               documents:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *     responses:
//  *       201:
//  *         description: Booking created successfully
//  *       400:
//  *         description: Invalid input or unavailable car
//  *       500:
//  *         description: Internal server error
//  */
// router.post('/bookings', rentalBookingController.createBooking);

// /**
//  * @swagger
//  * /bookings:
//  *   get:
//  *     summary: Get all rental bookings
//  *     parameters:
//  *       - in: query
//  *         name: startDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter by booking start date
//  *       - in: query
//  *         name: endDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter by booking end date
//  *     responses:
//  *       200:
//  *         description: A list of rental bookings
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings', rentalBookingController.getAllBookings);

// /**
//  * @swagger
//  * /bookings/{id}:
//  *   get:
//  *     summary: Get a rental booking by ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The rental booking ID
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Rental booking details
//  *       404:
//  *         description: Booking not found
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings/:id', rentalBookingController.getBookingById);

// /**
//  * @swagger
//  * /bookings/{id}/status:
//  *   patch:
//  *     summary: Update the status of a rental booking
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The rental booking ID
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [pending, confirmed, active, completed, cancelled]
//  *               remarks:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Booking status updated successfully
//  *       400:
//  *         description: Invalid status or transition
//  *       404:
//  *         description: Booking not found
//  *       500:
//  *         description: Internal server error
//  */
// router.patch('/bookings/:id/status', rentalBookingController.updateBookingStatus);

// /**
//  * @swagger
//  * /bookings/user/{userId}:
//  *   get:
//  *     summary: Get all bookings for a specific user
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         description: The user ID
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: A list of bookings for the specified user
//  *       404:
//  *         description: No bookings found for the user
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings/user/:userId', rentalBookingController.getUserBookings);

// /**
//  * @swagger
//  * /bookings/provider/{providerId}:
//  *   get:
//  *     summary: Get all bookings for a specific provider
//  *     parameters:
//  *       - in: path
//  *         name: providerId
//  *         required: true
//  *         description: The provider ID
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: A list of bookings for the specified provider
//  *       404:
//  *         description: No bookings found for the provider
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings/provider/:providerId', rentalBookingController.getProviderBookings);

// /**
//  * @swagger
//  * /bookings/stats:
//  *   get:
//  *     summary: Get booking statistics
//  *     responses:
//  *       200:
//  *         description: Booking statistics
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings/stats', rentalBookingController.getBookingStats);

// module.exports = router;





// const express = require('express');
// const router = express.Router();
// const rentalBookingController = require('../controllers/rentalBookingController');

// /**
//  * @swagger
//  * /bookings:
//  *   post:
//  *     summary: Create a new rental booking
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userId:
//  *                 type: string
//  *               carId:
//  *                 type: string
//  *               startDate:
//  *                 type: string
//  *                 format: date
//  *               endDate:
//  *                 type: string
//  *                 format: date
//  *               totalAmount:
//  *                 type: number
//  *               status:
//  *                 type: string
//  *               documents:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *     responses:
//  *       201:
//  *         description: Booking created successfully
//  *       400:
//  *         description: Invalid input or unavailable car
//  *       500:
//  *         description: Internal server error
//  */
// router.post('/bookings', rentalBookingController.createBooking);

// /**
//  * @swagger
//  * /bookings:
//  *   get:
//  *     summary: Get all rental bookings
//  *     parameters:
//  *       - in: query
//  *         name: startDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter by booking start date
//  *       - in: query
//  *         name: endDate
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter by booking end date
//  *     responses:
//  *       200:
//  *         description: A list of rental bookings
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings', rentalBookingController.getAllBookings);

// /**
//  * @swagger
//  * /bookings/{id}:
//  *   get:
//  *     summary: Get a rental booking by ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The rental booking ID
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Rental booking details
//  *       404:
//  *         description: Booking not found
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings/:id', rentalBookingController.getBookingById);

// /**
//  * @swagger
//  * /bookings/{id}/status:
//  *   patch:
//  *     summary: Update the status of a rental booking
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The rental booking ID
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [pending, confirmed, active, completed, cancelled]
//  *               remarks:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Booking status updated successfully
//  *       400:
//  *         description: Invalid status or transition
//  *       404:
//  *         description: Booking not found
//  *       500:
//  *         description: Internal server error
//  */
// router.patch('/bookings/:id/status', rentalBookingController.updateBookingStatus);

// /**
//  * @swagger
//  * /bookings/user/{userId}:
//  *   get:
//  *     summary: Get all bookings for a specific user
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         description: The user ID
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: A list of bookings for the specified user
//  *       404:
//  *         description: No bookings found for the user
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings/user/:userId', rentalBookingController.getUserBookings);

// /**
//  * @swagger
//  * /bookings/provider/{providerId}:
//  *   get:
//  *     summary: Get all bookings for a specific provider
//  *     parameters:
//  *       - in: path
//  *         name: providerId
//  *         required: true
//  *         description: The provider ID
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: A list of bookings for the specified provider
//  *       404:
//  *         description: No bookings found for the provider
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings/provider/:providerId', rentalBookingController.getProviderBookings);

// /**
//  * @swagger
//  * /bookings/stats:
//  *   get:
//  *     summary: Get booking statistics
//  *     responses:
//  *       200:
//  *         description: Booking statistics
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/bookings/stats', rentalBookingController.getBookingStats);

// module.exports = router;
