const express = require('express');
const router = express.Router();
const serviceProviderController = require('../controllers/serviceProviderController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         serviceType:
 *           type: string
 *           description: ID of the service type
 *         price:
 *           type: number
 *           format: float
 *           description: Price of the service
 *     ServiceProvider:
 *       type: object
 *       required:
 *         - userId
 *         - providerName
 *         - contactInfo
 *         - address
 *         - about
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the associated user
 *         providerName:
 *           type: string
 *           description: Name of the service provider
 *         contactInfo:
 *           type: string
 *           description: Contact information
 *         address:
 *           type: string
 *           description: Physical address
 *         about:
 *           type: string
 *           description: Description about the provider
 *         ratings:
 *           type: string
 *           description: Provider ratings
 *         services:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Service'
 */

/**
 * @swagger
 * /user/service-providers:
 *   post:
 *     tags: [Service Providers]
 *     summary: Create a new service provider
 *     title: Create Service Provider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceProvider'
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
 * /user/service-providers:
 *   get:
 *     tags: [Service Providers]
 *     summary: Get all service providers with filters
 *     title: List Service Providers
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceProvider'
 *       500:
 *         description: Internal server error
 */
router.get('/service-providers', serviceProviderController.getAllProviders);

/**
 * @swagger
 * /user/service-providers/{id}:
 *   get:
 *     tags: [Service Providers]
 *     summary: Get service provider by ID
 *     title: Get Service Provider
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceProvider'
 *       404:
 *         description: Service provider not found
 */
router.get('/service-providers/:id', serviceProviderController.getProviderById);

/**
 * @swagger
 * /user/service-providers/{id}:
 *   put:
 *     tags: [Service Providers]
 *     summary: Update a service provider
 *     title: Update Service Provider
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
 *             $ref: '#/components/schemas/ServiceProvider'
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
 * /user/service-providers/{id}:
 *   delete:
 *     tags: [Service Providers]
 *     summary: Delete a service provider
 *     title: Delete Service Provider
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
 * /user/service-providers/{providerId}/services:
 *   post:
 *     tags: [Service Provider Services]
 *     summary: Add a service to a provider
 *     title: Add Service to Provider
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
 *             $ref: '#/components/schemas/Service'
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
 * /user/service-providers/{providerId}/services/{serviceId}:
 *   delete:
 *     tags: [Service Provider Services]
 *     summary: Remove a service from a provider
 *     title: Remove Service from Provider
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
 * /user/service-providers/search:
 *   get:
 *     tags: [Service Providers]
 *     summary: Search service providers
 *     title: Search Service Providers
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceProvider'
 *       500:
 *         description: Internal server error
 */
router.get('/service-providers/search', serviceProviderController.searchProviders);

/**
 * @swagger
 * /user/service-providers/{providerId}/stats:
 *   get:
 *     tags: [Service Providers]
 *     summary: Get statistics for a provider
 *     title: Get Provider Statistics
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalServices:
 *                   type: integer
 *                   description: Total number of services offered
 *                 averageRating:
 *                   type: number
 *                   format: float
 *                   description: Average rating of the provider
 *       404:
 *         description: Service provider not found
 */
router.get('/service-providers/:providerId/stats', serviceProviderController.getProviderStats);

module.exports = router;
