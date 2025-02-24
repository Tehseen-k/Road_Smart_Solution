const express = require('express');
const router = express.Router();
const serviceTypeController = require('../controllers/serviceTypeController');

/**
 * @swagger
 * /service-types:
 *   post:
 *     summary: Create a new service type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               subcategoryId:
 *                 type: string
 *               standardPrice:
 *                 type: number
 *               estimatedTime:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Service type created successfully
 *       400:
 *         description: Invalid subcategory ID or file type
 *       404:
 *         description: Subcategory not found
 */
router.post('/service-types', serviceTypeController.createServiceType);

/**
 * @swagger
 * /service-types:
 *   get:
 *     summary: Get all service types
 *     parameters:
 *       - in: query
 *         name: priceRange
 *         description: Price range filter in format "min-max"
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of service types
 *       400:
 *         description: Invalid query parameters
 */
router.get('/service-types', serviceTypeController.getAllServiceTypes);

/**
 * @swagger
 * /service-types/{id}:
 *   get:
 *     summary: Get a service type by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service type ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service type found
 *       400:
 *         description: Invalid service type ID
 *       404:
 *         description: Service type not found
 */
router.get('/service-types/:id', serviceTypeController.getServiceTypeById);

/**
 * @swagger
 * /service-types/{id}:
 *   put:
 *     summary: Update a service type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service type ID
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
 *               description:
 *                 type: string
 *               standardPrice:
 *                 type: number
 *               estimatedTime:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Service type updated successfully
 *       400:
 *         description: Invalid file type or service type not found
 *       404:
 *         description: Service type not found
 */
router.put('/service-types/:id', serviceTypeController.updateServiceType);

/**
 * @swagger
 * /service-types/{id}:
 *   delete:
 *     summary: Delete a service type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service type ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Service type deleted successfully
 *       400:
 *         description: Invalid service type ID or active requests
 *       404:
 *         description: Service type not found
 */
router.delete('/service-types/:id', serviceTypeController.deleteServiceType);

/**
 * @swagger
 * /service-types/subcategory/{subcategoryId}:
 *   get:
 *     summary: Get all service types by subcategory ID
 *     parameters:
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         description: The subcategory ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of service types for a specific subcategory
 *       400:
 *         description: Invalid subcategory ID
 */
router.get('/service-types/subcategory/:subcategoryId', serviceTypeController.getServiceTypesBySubcategory);

/**
 * @swagger
 * /service-types/search:
 *   get:
 *     summary: Search for service types
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: The search query
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of matching service types
 *       400:
 *         description: Invalid query parameter
 */
router.get('/service-types/search', serviceTypeController.searchServiceTypes);

/**
 * @swagger
 * /service-types/stats:
 *   get:
 *     summary: Get service type statistics
 *     responses:
 *       200:
 *         description: Service type statistics
 */
router.get('/service-types/stats', serviceTypeController.getServiceTypeStats);

module.exports = router;
