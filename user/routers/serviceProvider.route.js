const express = require('express');
const router = express.Router();
const serviceProviderController = require('../controllers/serviceProviderController');

/**
 * @swagger
 * /service-providers:
 *   post:
 *     summary: Create a new service provider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               providerName:
 *                 type: string
 *               about:
 *                 type: string
 *               address:
 *                 type: string
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceTypeId:
 *                       type: string
 *                     price:
 *                       type: number
 *                       format: float
 *     responses:
 *       201:
 *         description: Service provider created successfully
 *       400:
 *         description: Service provider already exists for this user or invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/service-providers', serviceProviderController.createServiceProvider);

/**
 * @swagger
 * /service-providers:
 *   get:
 *     summary: Get all service providers with filters
 *     parameters:
 *       - in: query
 *         name: serviceType
 *         description: Filter by service type
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         description: Filter by minimum rating
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: Pagination page number
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         description: Pagination limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of service providers
 *       500:
 *         description: Internal server error
 */
router.get('/service-providers', serviceProviderController.getAllProviders);

/**
 * @swagger
 * /service-providers/{id}:
 *   get:
 *     summary: Get service provider by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service provider ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service provider found
 *       404:
 *         description: Service provider not found
 */
router.get('/service-providers/:id', serviceProviderController.getProviderById);

/**
 * @swagger
 * /service-providers/{id}:
 *   put:
 *     summary: Update a service provider
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service provider ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerName:
 *                 type: string
 *               about:
 *                 type: string
 *               address:
 *                 type: string
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceTypeId:
 *                       type: string
 *                     price:
 *                       type: number
 *                       format: float
 *     responses:
 *       200:
 *         description: Service provider updated successfully
 *       400:
 *         description: Invalid provider ID
 *       404:
 *         description: Service provider not found
 *       500:
 *         description: Internal server error
 */
router.put('/service-providers/:id', serviceProviderController.updateProvider);

/**
 * @swagger
 * /service-providers/{id}:
 *   delete:
 *     summary: Delete a service provider
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service provider ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service provider deleted successfully
 *       404:
 *         description: Service provider not found
 *       500:
 *         description: Internal server error
 */
router.delete('/service-providers/:id', serviceProviderController.deleteProvider);

/**
 * @swagger
 * /service-providers/{providerId}/services:
 *   post:
 *     summary: Add a service to a provider
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The service provider ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceTypeId:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Service added successfully
 *       404:
 *         description: Service provider or service type not found
 *       400:
 *         description: Service already exists for this provider
 */
router.post('/service-providers/:providerId/services', serviceProviderController.addService);

/**
 * @swagger
 * /service-providers/{providerId}/services/{serviceId}:
 *   delete:
 *     summary: Remove a service from a provider
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The service provider ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: serviceId
 *         required: true
 *         description: The service ID to remove
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Service removed successfully
 *       404:
 *         description: Service not found for this provider
 */
router.delete('/service-providers/:providerId/services/:serviceId', serviceProviderController.removeService);

/**
 * @swagger
 * /service-providers/search:
 *   get:
 *     summary: Search service providers
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query string (name, about, address, etc.)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching service providers
 *       500:
 *         description: Internal server error
 */
router.get('/service-providers/search', serviceProviderController.searchProviders);

/**
 * @swagger
 * /service-providers/{providerId}/stats:
 *   get:
 *     summary: Get statistics for a provider
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The provider ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service provider stats
 *       404:
 *         description: Service provider not found
 */
router.get('/service-providers/:providerId/stats', serviceProviderController.getProviderStats);

module.exports = router;
