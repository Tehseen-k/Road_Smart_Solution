const express = require('express');
const router = express.Router();
const userCarController = require('../controllers/userCarController');
const upload = require('../../utils/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCar:
 *       type: object
 *       required:
 *         - userId
 *         - carMake
 *         - carModel
 *         - fuelType
 *         - driveType
 *         - bodyType
 *       properties:
 *         userId:
 *           type: string
 *           description: Reference to the user who owns the car
 *         carName:
 *           type: string
 *         carMake:
 *           type: string
 *         carModel:
 *           type: string
 *         carYear:
 *           type: number
 *         trim:
 *           type: string
 *         engine:
 *           type: string
 *         cylinders:
 *           type: number
 *         fuelType:
 *           type: string
 *           enum: [petrol, diesel, electric]
 *         driveType:
 *           type: string
 *           enum: [AWD, FWD, RWD]
 *         bodyType:
 *           type: string
 *           enum: [sedan, suv, hatchback, etc]
 *         estimatedValue:
 *           type: number
 *         odometer:
 *           type: number
 *         vin:
 *           type: string
 *           unique: true
 *         registrationNum:
 *           type: string
 *           maxLength: 50
 *         country:
 *           type: string
 *         documents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               docName:
 *                 type: string
 *               filePath:
 *                 type: string
 */

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Create a new car for a user
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - carMake
 *               - carModel
 *             properties:
 *               userId:
 *                 type: string
 *               carMake:
 *                 type: string
 *               carModel:
 *                 type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Car created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserCar'
 */
router.post('/cars', upload.array('documents'), userCarController.createUserCar);

/**
 * @swagger
 * /users/{userId}/cars:
 *   get:
 *     summary: Get all cars for a specific user
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cars:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCar'
 */
router.get('/users/:userId/cars', userCarController.getUserCars);

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get car by ID
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserCar'
 *   patch:
 *     summary: Update car details
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               carMake:
 *                 type: string
 *               carModel:
 *                 type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Car updated successfully
 *   delete:
 *     summary: Delete car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Car deleted successfully
 */
router.get('/cars/:id', userCarController.getCarById);
router.patch('/cars/:id', upload.array('documents'), userCarController.updateCar);
router.delete('/cars/:id', userCarController.deleteCar);

/**
 * @swagger
 * /cars/{carId}/documents:
 *   post:
 *     summary: Add document to car
 *     tags: [Car Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document added successfully
 */
router.post('/cars/:carId/documents', upload.single('document'), userCarController.addCarDocument);

/**
 * @swagger
 * /documents/{docId}:
 *   delete:
 *     summary: Delete car document
 *     tags: [Car Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Document deleted successfully
 */
router.delete('/documents/:docId', userCarController.deleteCarDocument);

/**
 * @swagger
 * /cars/search:
 *   get:
 *     summary: Search cars
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for car name, make, model, VIN, or registration number
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserCar'
 */
router.get('/cars/search', userCarController.searchCars);

module.exports = router;