const express = require('express');
const router = express.Router();
const carPartController = require('../controllers/carPartController');
const upload = require('../../utils/upload'); // Assuming you have a file upload middleware

/**
 * @swagger
 * tags:
 *   name: Car Parts
 *   description: Car part management
 */

/**
 * @swagger
 * /car-part:
 *   post:
 *     summary: Create a new car part
 *     tags: [Car Parts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sellerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               name:
 *                 type: string
 *                 example: "Brake Pad"
 *               brand:
 *                 type: string
 *                 example: "Bosch"
 *               category:
 *                 type: string
 *                 example: "Brakes"
 *               compatibility:
 *                 type: string
 *                 example: "Toyota Camry 2015-2020"
 *               price:
 *                 type: number
 *                 example: 45.99
 *               stockQuantity:
 *                 type: number
 *                 example: 100
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               specifications:
 *                 type: string
 *                 example: "High-performance brake pad for smooth stopping."
 *     responses:
 *       201:
 *         description: Car part created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', upload.array('images'), carPartController.createCarPart);

/**
 * @swagger
 * /car-part:
 *   get:
 *     summary: Get all car parts with filters
 *     tags: [Car Parts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         example: 10
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         example: 100
 *       - in: query
 *         name: make
 *         schema:
 *           type: string
 *         example: "Toyota"
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         example: "Camry"
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         example: "2015"
 *     responses:
 *       200:
 *         description: List of car parts
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', carPartController.getAllParts);

/**
 * @swagger
 * /car-part/{id}:
 *   get:
 *     summary: Get a car part by ID
 *     tags: [Car Parts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Car part details
 *       404:
 *         description: Car part not found
 */
router.get('/:id', carPartController.getPartById);

/**
 * @swagger
 * /car-part/{id}:
 *   patch:
 *     summary: Update a car part
 *     tags: [Car Parts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Brake Pad"
 *               brand:
 *                 type: string
 *                 example: "Bosch"
 *               category:
 *                 type: string
 *                 example: "Brakes"
 *               compatibility:
 *                 type: string
 *                 example: "Toyota Camry 2015-2020"
 *               price:
 *                 type: number
 *                 example: 45.99
 *               stockQuantity:
 *                 type: number
 *                 example: 100
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               specifications:
 *                 type: string
 *                 example: "High-performance brake pad for smooth stopping."
 *     responses:
 *       200:
 *         description: Car part updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Car part not found
 */
router.patch('/:id', upload.array('images'), carPartController.updatePart);

/**
 * @swagger
 * /car-part/car-parts/{id}:
 *   delete:
 *     summary: Delete a car part
 *     tags: [Car Parts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       204:
 *         description: Car part deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Car part not found
 */
router.delete('/:id', carPartController.deletePart);

/**
 * @swagger
 * /car-part/search:
 *   get:
 *     summary: Search car parts
 *     tags: [Car Parts]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         example: "Brake Pad"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of matching car parts
 *       400:
 *         description: Invalid query
 */
router.get('/search', carPartController.searchParts);

/**
 * @swagger
 * /car-part/category/{category}:
 *   get:
 *     summary: Get car parts by category
 *     tags: [Car Parts]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         example: "Brakes"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of car parts in the category
 *       400:
 *         description: Invalid category
 */
router.get('/category/:category', carPartController.getPartsByCategory);

/**
 * @swagger
 * /car-part/car-parts/stats:
 *   get:
 *     summary: Get car part statistics
 *     tags: [Car Parts]
 *     responses:
 *       200:
 *         description: Car part statistics
 */
router.get('/stats', carPartController.getPartStats);

module.exports = router;