const express = require('express');
const router = express.Router();
const rentalCarController = require('../controllers/rentalCarController');

/**
 * @swagger
 * /rental-cars:
 *   post:
 *     summary: Create a new rental car
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerId:
 *                 type: string
 *               vin:
 *                 type: string
 *               dailyRate:
 *                 type: number
 *               availability:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Rental car created successfully
 *       400:
 *         description: Invalid input or car with VIN already exists
 *       500:
 *         description: Internal server error
 */
router.post('/rental-cars', rentalCarController.createRentalCar);

/**
 * @swagger
 * /rental-cars:
 *   get:
 *     summary: Get all rental cars with filters
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date for availability
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date for availability
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Filter by minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Filter by maximum price
 *     responses:
 *       200:
 *         description: A list of rental cars
 *       500:
 *         description: Internal server error
 */
router.get('/rental-cars', rentalCarController.getAllRentalCars);

/**
 * @swagger
 * /rental-cars/{id}:
 *   get:
 *     summary: Get rental car by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental car ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rental car details
 *       404:
 *         description: Rental car not found
 *       500:
 *         description: Internal server error
 */
router.get('/rental-cars/:id', rentalCarController.getRentalCarById);

/**
 * @swagger
 * /rental-cars/{id}:
 *   put:
 *     summary: Update rental car details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental car ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vin:
 *                 type: string
 *               dailyRate:
 *                 type: number
 *               availability:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rental car updated successfully
 *       400:
 *         description: Invalid rental car ID or file type
 *       404:
 *         description: Rental car not found
 *       500:
 *         description: Internal server error
 */
router.put('/rental-cars/:id', rentalCarController.updateRentalCar);

/**
 * @swagger
 * /rental-cars/{id}:
 *   delete:
 *     summary: Delete a rental car by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental car ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Rental car deleted successfully
 *       404:
 *         description: Rental car not found
 *       400:
 *         description: Cannot delete car with future bookings
 *       500:
 *         description: Internal server error
 */
router.delete('/rental-cars/:id', rentalCarController.deleteRentalCar);

/**
 * @swagger
 * /rental-cars/availability:
 *   get:
 *     summary: Check car availability
 *     parameters:
 *       - in: query
 *         name: carId
 *         required: true
 *         description: The rental car ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: The start date for booking
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: The end date for booking
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Car availability status
 *       400:
 *         description: Invalid car ID or date range
 *       500:
 *         description: Internal server error
 */
router.get('/rental-cars/availability', rentalCarController.checkAvailability);

/**
 * @swagger
 * /rental-cars/stats/{providerId}:
 *   get:
 *     summary: Get rental car statistics
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The provider ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rental car statistics
 *       400:
 *         description: Invalid provider ID
 *       500:
 *         description: Internal server error
 */
router.get('/rental-cars/stats/:providerId', rentalCarController.getRentalStats);

module.exports = router;
