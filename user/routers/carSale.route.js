const express = require('express');
const router = express.Router();
const carSaleController = require('../controllers/carSaleController');

/**
 * @swagger
 * /car-sales:
 *   post:
 *     summary: Create a new car listing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sellerId:
 *                 type: string
 *               vin:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               mileage:
 *                 type: integer
 *               price:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       201:
 *         description: Car listing created successfully
 *       400:
 *         description: Invalid seller ID or car VIN already exists
 *       500:
 *         description: Internal server error
 */
router.post('/car-sales', carSaleController.createCarListing);

/**
 * @swagger
 * /car-sales:
 *   get:
 *     summary: Get all car listings with filters
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         description: Minimum price for the car listings
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: maxPrice
 *         description: Maximum price for the car listings
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: minYear
 *         description: Minimum year for the car listings
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxYear
 *         description: Maximum year for the car listings
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxMileage
 *         description: Maximum mileage for the car listings
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of car listings
 *       500:
 *         description: Internal server error
 */
router.get('/car-sales', carSaleController.getAllListings);

/**
 * @swagger
 * /car-sales/{id}:
 *   get:
 *     summary: Get car listing by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car listing ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car listing found
 *       400:
 *         description: Invalid listing ID
 *       404:
 *         description: Car listing not found
 */
router.get('/car-sales/:id', carSaleController.getListingById);

/**
 * @swagger
 * /car-sales/{id}:
 *   put:
 *     summary: Update car listing by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car listing ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               mileage:
 *                 type: integer
 *               price:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Car listing updated successfully
 *       400:
 *         description: Invalid listing ID
 *       404:
 *         description: Car listing not found
 *       500:
 *         description: Internal server error
 */
router.put('/car-sales/:id', carSaleController.updateListing);

/**
 * @swagger
 * /car-sales/{id}:
 *   delete:
 *     summary: Delete car listing by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car listing ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car listing deleted successfully
 *       400:
 *         description: Invalid listing ID
 *       404:
 *         description: Car listing not found
 *       500:
 *         description: Internal server error
 */
router.delete('/car-sales/:id', carSaleController.deleteListing);

/**
 * @swagger
 * /car-sales/search:
 *   get:
 *     summary: Search for car listings based on query
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query string
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching car listings
 *       500:
 *         description: Internal server error
 */
router.get('/car-sales/search', carSaleController.searchListings);

/**
 * @swagger
 * /car-sales/seller/{sellerId}:
 *   get:
 *     summary: Get car listings by seller ID
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         description: The seller ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of car listings for the seller
 *       400:
 *         description: Invalid seller ID
 *       500:
 *         description: Internal server error
 */
router.get('/car-sales/seller/:sellerId', carSaleController.getSellerListings);

/**
 * @swagger
 * /car-sales/stats:
 *   get:
 *     summary: Get car listing statistics
 *     responses:
 *       200:
 *         description: Car listing statistics
 *       500:
 *         description: Internal server error
 */
router.get('/car-sales/stats', carSaleController.getListingStats);

module.exports = router;
