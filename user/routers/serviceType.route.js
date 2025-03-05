const express = require('express');
const router = express.Router();
const serviceTypeController = require('../controllers/serviceTypeController');

/**
 * @swagger
 * tags:
 *   name: Service Types
 *   description: API endpoints for managing service types
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceType:
 *       type: object
 *       required:
 *         - subcategoryId
 *         - serviceName
 *         - description
 *       properties:
 *         subcategoryId:
 *           type: string
 *           description: Reference ID to the service subcategory
 *         serviceName:
 *           type: string
 *           description: Name of the service type
 *         description:
 *           type: string
 *           description: Description of the service type
 *     ServiceTypeResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceType'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The auto-generated id of the service type
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /user/service-types:
 *   post:
 *     tags: [Service Types]
 *     summary: Create a new service type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceType'
 *     responses:
 *       201:
 *         description: Service type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceTypeResponse'
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Subcategory not found
 */
router.post('/service-types', serviceTypeController.createServiceType);

/**
 * @swagger
 * /user/service-types:
 *   get:
 *     tags: [Service Types]
 *     summary: Get all service types
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: List of service types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceTypeResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       400:
 *         description: Invalid query parameters
 */
router.get('/service-types', serviceTypeController.getAllServiceTypes);

/**
 * @swagger
 * /user/service-types/{id}:
 *   get:
 *     tags: [Service Types]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceTypeResponse'
 *       400:
 *         description: Invalid service type ID
 *       404:
 *         description: Service type not found
 */
router.get('/service-types/:id', serviceTypeController.getServiceTypeById);

/**
 * @swagger
 * /user/service-types/{id}:
 *   put:
 *     tags: [Service Types]
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
 *             $ref: '#/components/schemas/ServiceType'
 *     responses:
 *       200:
 *         description: Service type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceTypeResponse'
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Service type not found
 */
router.put('/service-types/:id', serviceTypeController.updateServiceType);

/**
 * @swagger
 * /user/service-types/{id}:
 *   delete:
 *     tags: [Service Types]
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
 *         description: Invalid service type ID
 *       404:
 *         description: Service type not found
 */
router.delete('/service-types/:id', serviceTypeController.deleteServiceType);

/**
 * @swagger
 * /user/service-types/subcategory/{subcategoryId}:
 *   get:
 *     tags: [Service Types]
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
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: List of service types for a specific subcategory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceTypeResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       400:
 *         description: Invalid subcategory ID
 */
router.get('/service-types/subcategory/:subcategoryId', serviceTypeController.getServiceTypesBySubcategory);

/**
 * @swagger
 * /user/service-types/search:
 *   get:
 *     tags: [Service Types]
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
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: List of matching service types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceTypeResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       400:
 *         description: Invalid query parameter
 */
router.get('/service-types/search', serviceTypeController.searchServiceTypes);

/**
 * @swagger
 * /user/service-types/stats:
 *   get:
 *     tags: [Service Types]
 *     summary: Get service type statistics
 *     responses:
 *       200:
 *         description: Service type statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalServiceTypes:
 *                   type: integer
 *                 activeServiceTypes:
 *                   type: integer
 */
router.get('/service-types/stats', serviceTypeController.getServiceTypeStats);

module.exports = router;
