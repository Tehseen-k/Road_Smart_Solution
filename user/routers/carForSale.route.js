const express = require('express');
const router = express.Router();
const carForSaleController = require('../controllers/carForSaleController');

/**
 * @swagger
 * /car-for-sale:
 *   post:
 *     summary: Create a new car listing for sale
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sale_id:
 *                 type: string
 *               seller_id:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               vin:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               mileage:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Car listing created successfully
 *       400:
 *         description: Car with this VIN already exists
 *       500:
 *         description: Internal server error
 */
router.post('/car-for-sale', carForSaleController.createCarListing);

/**
 * @swagger
 * /car-for-sale:
 *   get:
 *     summary: Get all car listings for sale with filters
 *     parameters:
 *       - in: query
 *         name: make
 *         description: Filter by car make
 *         schema:
 *           type: string
 *       - in: query
 *         name: model
 *         description: Filter by car model
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         description: Filter by car year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         description: Filter by car listing status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of car listings
 *       500:
 *         description: Internal server error
 */
router.get('/car-for-sale', carForSaleController.getAllListings);

/**
 * @swagger
 * /car-for-sale/{id}:
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
router.get('/car-for-sale/:id', carForSaleController.getListingById);

/**
 * @swagger
 * /car-for-sale/{id}:
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
 *               vin:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Car listing updated successfully
 *       400:
 *         description: Invalid listing ID or VIN already exists
 *       404:
 *         description: Car listing not found
 *       500:
 *         description: Internal server error
 */
router.put('/car-for-sale/:id', carForSaleController.updateListing);

/**
 * @swagger
 * /car-for-sale/{id}:
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
router.delete('/car-for-sale/:id', carForSaleController.deleteListing);

/**
 * @swagger
 * /car-for-sale/search:
 *   get:
 *     summary: Search for car listings based on a query string
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
router.get('/car-for-sale/search', carForSaleController.getAllListings);

/**
 * @swagger
 * /car-for-sale/seller/{sellerId}:
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
router.get('/car-for-sale/seller/:sellerId', carForSaleController.getSellerListings);

/**
 * @swagger
 * /car-for-sale/{id}/sold:
 *   put:
 *     summary: Mark car listing as sold
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The car listing ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car listing marked as sold
 *       400:
 *         description: Invalid listing ID
 *       404:
 *         description: Car listing not found
 */
router.put('/car-for-sale/:id/sold', carForSaleController.markAsSold);

/**
 * @swagger
 * /car-for-sale/{id}/image:
 *   post:
 *     summary: Add image to a car listing
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image added to the listing
 *       400:
 *         description: Invalid listing ID or no image provided
 *       404:
 *         description: Car listing not found
 */
router.post('/car-for-sale/:id/image', carForSaleController.addListingImage);

module.exports = router;
