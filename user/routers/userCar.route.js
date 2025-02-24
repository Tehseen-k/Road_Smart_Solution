const express = require('express');
const router = express.Router();
const userCarController = require('../controllers/userCarController');
const upload = require('../../utils/upload');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *           description: Valid MongoDB ObjectId of the user
 *           example: 60d5ec9af8b7a61234567890
 *         carName:
 *           type: string
 *           example: "My Daily Driver"
 *         carMake:
 *           type: string
 *           example: "Toyota"
 *         carModel:
 *           type: string
 *           example: "Camry"
 *         carYear:
 *           type: integer
 *           example: 2020
 *         trim:
 *           type: string
 *           example: "LE"
 *         engine:
 *           type: string
 *           example: "2.5L 4-cylinder"
 *         cylinders:
 *           type: integer
 *           example: 4
 *         fuelType:
 *           type: string
 *           enum: [petrol, diesel, electric]
 *           example: petrol
 *         driveType:
 *           type: string
 *           enum: [AWD, FWD, RWD]
 *           example: FWD
 *         bodyType:
 *           type: string
 *           enum: [sedan, suv, hatchback, etc]
 *           example: sedan
 *         estimatedValue:
 *           type: number
 *           example: 25000
 *         odometer:
 *           type: number
 *           example: 15000
 *         vin:
 *           type: string
 *           description: Unique vehicle identification number
 *           example: "1HGBH41JXMN109186"
 *         registrationNum:
 *           type: string
 *           example: "ABC123"
 *         country:
 *           type: string
 *           example: "USA"
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CarDocument'
 *     CarDocument:
 *       type: object
 *       properties:
 *         docName:
 *           type: string
 *           example: "insurance.pdf"
 *         filePath:
 *           type: string
 *           example: "uploads/car-documents/insurance.pdf"
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: integer
 *         itemCount:
 *           type: integer
 *         itemsPerPage:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         currentPage:
 *           type: integer
 */

/**
 * @swagger
 * /user-car/cars:
 *   post:
 *     summary: Create a new car with optional documents
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
 *               - fuelType
 *               - driveType
 *               - bodyType
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 60d5ec9af8b7a61234567890
 *               carName:
 *                 type: string
 *                 example: "My Daily Driver"
 *               carMake:
 *                 type: string
 *                 example: "Toyota"
 *               carModel:
 *                 type: string
 *                 example: "Camry"
 *               carYear:
 *                 type: integer
 *                 example: 2020
 *               trim:
 *                 type: string
 *                 example: "LE"
 *               engine:
 *                 type: string
 *                 example: "2.5L 4-cylinder"
 *               cylinders:
 *                 type: integer
 *                 example: 4
 *               fuelType:
 *                 type: string
 *                 enum: [petrol, diesel, electric]
 *                 example: petrol
 *               driveType:
 *                 type: string
 *                 enum: [AWD, FWD, RWD]
 *                 example: FWD
 *               bodyType:
 *                 type: string
 *                 enum: [sedan, suv, hatchback, etc]
 *                 example: sedan
 *               estimatedValue:
 *                 type: number
 *                 example: 25000
 *               odometer:
 *                 type: number
 *                 example: 15000
 *               vin:
 *                 type: string
 *                 example: "1HGBH41JXMN109186"
 *               registrationNum:
 *                 type: string
 *                 example: "ABC123"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Supported file types - PDF, JPG, JPEG, PNG
 *     responses:
 *       201:
 *         description: Car created successfully with documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/UserCar'
 *                 message:
 *                   type: string
 *                   example: "Car created successfully"
 */
router.post('/cars', upload.array('documents'), userCarController.createUserCar);

/**
 * @swagger
 * /user-car/users/{userId}/cars:
 *   get:
 *     summary: Get paginated cars for user
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
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated car results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cars:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCar'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/users/:userId/cars', userCarController.getUserCars);

/**
 * @swagger
 * /user-car/cars/{id}:
 *   get:
 *     summary: Get car details by ID
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
 *             $ref: '#/components/schemas/UserCar'
 *     responses:
 *       200:
 *         description: Updated car details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserCar'
 *   delete:
 *     summary: Delete a car
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
 * /user-car/cars/{carId}/documents:
 *   post:
 *     summary: Upload document for car
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
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarDocument'
 */
router.post('/cars/:carId/documents', upload.single('document'), userCarController.addCarDocument);

/**
 * @swagger
 * /user-car/documents/{docId}:
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
 *         description: Document deleted
 */
router.delete('/documents/:docId', userCarController.deleteCarDocument);

/**
 * @swagger
 * /user-car/cars/search:
 *   get:
 *     summary: Search cars by multiple fields
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
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