/**
 * @swagger
 * components:
 *   schemas:
 *     CarSale:
 *       type: object
 *       required:
 *         - sellerId
 *         - make
 *         - model
 *         - year
 *         - vin
 *         - price
 *       properties:
 *         sellerId:
 *           type: string
 *           description: ID of the car seller
 *         make:
 *           type: string
 *           description: Car manufacturer
 *         model:
 *           type: string
 *           description: Car model
 *         year:
 *           type: integer
 *           description: Manufacturing year
 *         vin:
 *           type: string
 *           description: Vehicle Identification Number
 *         price:
 *           type: number
 *           description: Car price
 *         mileage:
 *           type: number
 *           description: Car mileage
 *         description:
 *           type: string
 *           description: Car description
 *         status:
 *           type: string
 *           enum: [available, sold]
 *           default: available
 *           description: Car sale status
 * 
 * tags:
 *   - name: Car Sales
 *     description: Car sales management API
 */

const express = require('express');
const router = express.Router();
const carSaleController = require('../controllers/carSaleController');

/**
 * @swagger
 * /user/car-sales:
 *   post:
 *     tags: [Car Sales]
 *     summary: Create a new car listing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CarSale'
 *     responses:
 *       201:
 *         description: Car listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarSale'
 *       400:
 *         description: Invalid seller ID or car VIN already exists
 *       500:
 *         description: Internal server error
 */
router.post('/car-sales', carSaleController.createCarListing);

/**
 * @swagger
 * /user/car-sales:
 *   get:
 *     tags: [Car Sales]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cars:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CarSale'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/car-sales', carSaleController.getAllListings);

/**
 * @swagger
 * /user/car-sales/{id}:
 *   get:
 *     tags: [Car Sales]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarSale'
 *       400:
 *         description: Invalid listing ID
 *       404:
 *         description: Car listing not found
 */
router.get('/car-sales/:id', carSaleController.getListingById);

/**
 * @swagger
 * /user/car-sales/{id}:
 *   put:
 *     tags: [Car Sales]
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
 *             $ref: '#/components/schemas/CarSale'
 *     responses:
 *       200:
 *         description: Car listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarSale'
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
 * /user/car-sales/{id}:
 *   delete:
 *     tags: [Car Sales]
 *     summary: Delete car listing by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car listing ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
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
 * /user/car-sales/search:
 *   get:
 *     tags: [Car Sales]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cars:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CarSale'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/car-sales/search', carSaleController.searchListings);

/**
 * @swagger
 * /user/car-sales/seller/{sellerId}:
 *   get:
 *     tags: [Car Sales]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cars:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CarSale'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Invalid seller ID
 *       500:
 *         description: Internal server error
 */
router.get('/car-sales/seller/:sellerId', carSaleController.getSellerListings);

/**
 * @swagger
 * /user/car-sales/stats:
 *   get:
 *     tags: [Car Sales]
 *     summary: Get car listing statistics
 *     responses:
 *       200:
 *         description: Car listing statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       avgPrice:
 *                         type: number
 *                       minPrice:
 *                         type: number
 *                       maxPrice:
 *                         type: number
 *                 makeStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       avgPrice:
 *                         type: number
 *       500:
 *         description: Internal server error
 */
router.get('/car-sales/stats', carSaleController.getListingStats);

module.exports = router;
