const express = require('express');
const router = express.Router();
const carSellerController = require('../controllers/carSellerController');

/**
 * @swagger
 * /car-sellers:
 *   post:
 *     summary: Create a new car seller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               businessName:
 *                 type: string
 *               businessType:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               taxId:
 *                 type: string
 *               description:
 *                 type: string
 *               operatingHours:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Car seller created successfully
 *       400:
 *         description: Seller with this email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/car-sellers', carSellerController.createSeller);

/**
 * @swagger
 * /car-sellers:
 *   get:
 *     summary: Get all car sellers with optional filters
 *     parameters:
 *       - in: query
 *         name: businessType
 *         required: false
 *         description: Filter sellers by business type
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         required: false
 *         description: Filter sellers by minimum rating
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         required: false
 *         description: Sort sellers by field
 *         schema:
 *           type: string
 *           enum: [rating, name]
 *     responses:
 *       200:
 *         description: A list of car sellers
 *       500:
 *         description: Internal server error
 */
router.get('/car-sellers', carSellerController.getAllSellers);

/**
 * @swagger
 * /car-sellers/{id}:
 *   get:
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
 * /car-sellers/{id}:
 *   put:
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               businessName:
 *                 type: string
 *               businessType:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               taxId:
 *                 type: string
 *               description:
 *                 type: string
 *               operatingHours:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
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
 * /car-sellers/{id}:
 *   delete:
 *     summary: Delete car seller by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car seller ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
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
 * /car-sellers/{id}/rating:
 *   patch:
 *     summary: Update car seller's rating
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
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Car seller's rating updated
 *       400:
 *         description: Invalid seller ID or rating
 *       404:
 *         description: Car seller not found
 *       500:
 *         description: Internal server error
 */
router.patch('/car-sellers/:id/rating', carSellerController.updateSellerRating);

/**
 * @swagger
 * /car-sellers/search:
 *   get:
 *     summary: Search for car sellers
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query string
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
