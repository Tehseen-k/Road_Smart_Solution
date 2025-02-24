const express = require('express');
const router = express.Router();
const rentalProviderController = require('../controllers/rentalProviderController');

/**
 * @swagger
 * /providers:
 *   post:
 *     summary: Create a new rental provider
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
 *               licenseNumber:
 *                 type: string
 *               taxId:
 *                 type: string
 *               description:
 *                 type: string
 *               operatingHours:
 *                 type: string
 *               rentalTerms:
 *                 type: string
 *               insuranceDetails:
 *                 type: string
 *               availableVehicleTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Rental provider created successfully
 *       400:
 *         description: Invalid input or provider already exists
 *       500:
 *         description: Internal server error
 */
router.post('/providers', rentalProviderController.createProvider);

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Get all rental providers with filters
 *     parameters:
 *       - in: query
 *         name: vehicleType
 *         schema:
 *           type: string
 *         description: Filter providers by available vehicle types
 *       - in: query
 *         name: rating
 *         schema:
 *           type: string
 *         description: Filter providers by rating
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter providers by status (active, deleted)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort providers by (rating, name)
 *     responses:
 *       200:
 *         description: A list of rental providers
 *       500:
 *         description: Internal server error
 */
router.get('/providers', rentalProviderController.getAllProviders);

/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     summary: Get a rental provider by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental provider ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rental provider details
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Internal server error
 */
router.get('/providers/:id', rentalProviderController.getProviderById);

/**
 * @swagger
 * /providers/{id}:
 *   put:
 *     summary: Update rental provider details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental provider ID
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
 *               licenseNumber:
 *                 type: string
 *               taxId:
 *                 type: string
 *               description:
 *                 type: string
 *               operatingHours:
 *                 type: string
 *               rentalTerms:
 *                 type: string
 *               insuranceDetails:
 *                 type: string
 *               availableVehicleTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rental provider updated successfully
 *       400:
 *         description: Invalid provider ID or input
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Internal server error
 */
router.put('/providers/:id', rentalProviderController.updateProvider);

/**
 * @swagger
 * /providers/{id}:
 *   delete:
 *     summary: Delete a rental provider by ID (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental provider ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider deleted successfully
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Internal server error
 */
router.delete('/providers/:id', rentalProviderController.deleteProvider);

/**
 * @swagger
 * /providers/{id}/rating:
 *   patch:
 *     summary: Update rental provider's rating
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The rental provider ID
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
 *                 description: The new rating value (1-5)
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       400:
 *         description: Invalid rating value
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Internal server error
 */
router.patch('/providers/:id/rating', rentalProviderController.updateProviderRating);

/**
 * @swagger
 * /providers/search:
 *   get:
 *     summary: Search rental providers by query
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query term
 *     responses:
 *       200:
 *         description: A list of rental providers matching the search query
 *       500:
 *         description: Internal server error
 */
router.get('/providers/search', rentalProviderController.searchProviders);

module.exports = router;
