const express = require('express');
const router = express.Router();
const carSellerController = require('../controllers/carSellerController');
/**
 * @swagger
 * tags:
 *   name: Car Seller Management
 *   description: APIs for managing car sellers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CarSeller:
 *       type: object
 *       required:
 *         - userId
 *         - businessName
 *       properties:
 *         userId:
 *           type: string
 *           description: Reference to the User model
 *         businessName:
 *           type: string
 *           description: Name of the car selling business
 *         contactInfo:
 *           type: string
 *           description: Contact information for the seller
 *         address:
 *           type: string
 *           description: Physical address of the business
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the record was last updated
 */

/**
 * @swagger
 * /user/car-sellers:
 *   post:
 *     tags: [Car Seller Management]
 *     summary: Create a new car seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - businessName
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the associated user
 *               businessName:
 *                 type: string
 *                 description: Name of the car selling business
 *               contactInfo:
 *                 type: string
 *                 description: Contact information for the seller
 *               address:
 *                 type: string
 *                 description: Physical address of the business
 *     responses:
 *       201:
 *         description: Car seller created successfully
 *       400:
 *         description: Seller already exists for this user
 *       500:
 *         description: Internal server error
 */
router.post('/car-sellers', carSellerController.createSeller);

/**
 * @swagger
 * /user/car-sellers:
 *   get:
 *     tags: [Car Seller Management]
 *     summary: Get all car sellers with optional filters
 *     parameters:
 *       - in: query
 *         name: businessName
 *         required: false
 *         description: Filter sellers by business name
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         required: false
 *         description: Sort sellers by field
 *         schema:
 *           type: string
 *           enum: [businessName, createdAt]
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of car sellers
 *       500:
 *         description: Internal server error
 */
router.get('/car-sellers', carSellerController.getAllSellers);

/**
 * @swagger
 * /user/car-sellers/{id}:
 *   get:
 *     tags: [Car Seller Management]
 *     summary: Get car seller by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car seller ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car seller found
 *       400:
 *         description: Invalid seller ID
 *       404:
 *         description: Car seller not found
 */
router.get('/car-sellers/:id', carSellerController.getSellerById);

/**
 * @swagger
 * /user/car-sellers/{id}:
 *   put:
 *     tags: [Car Seller Management]
 *     summary: Update car seller by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car seller ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: Name of the car selling business
 *               contactInfo:
 *                 type: string
 *                 description: Contact information for the seller
 *               address:
 *                 type: string
 *                 description: Physical address of the business
 *     responses:
 *       200:
 *         description: Car seller updated successfully
 *       400:
 *         description: Invalid seller ID
 *       404:
 *         description: Car seller not found
 *       500:
 *         description: Internal server error
 */
router.put('/car-sellers/:id', carSellerController.updateSeller);

/**
 * @swagger
 * /user/car-sellers/{id}:
 *   delete:
 *     tags: [Car Seller Management]
 *     summary: Delete car seller by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car seller ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Car seller deleted successfully
 *       400:
 *         description: Invalid seller ID
 *       404:
 *         description: Car seller not found
 *       500:
 *         description: Internal server error
 */
router.delete('/car-sellers/:id', carSellerController.deleteSeller);

/**
 * @swagger
 * /user/car-sellers/search:
 *   get:
 *     tags: [Car Seller Management]
 *     summary: Search for car sellers
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query string (searches in businessName, contactInfo, and address)
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of records per page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of matching car sellers
 *       500:
 *         description: Internal server error
 */
router.get('/car-sellers/search', carSellerController.searchSellers);

module.exports = router;

