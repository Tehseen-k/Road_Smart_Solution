/**
 * @swagger
 * tags:
 *   name: Service Subcategories
 *   description: API endpoints for managing service subcategories
 * 
 * components:
 *   schemas:
 *     ServiceSubcategory:
 *       type: object
 *       required:
 *         - name
 *         - categoryId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           description: Name of the subcategory
 *           minLength: 2
 *           maxLength: 50
 *         categoryId:
 *           type: string
 *           description: ID of the parent service category
 *         description:
 *           type: string
 *           description: Detailed description of the subcategory
 *           maxLength: 500
 *         icon:
 *           type: string
 *           description: URL or path to the subcategory icon
 *         isActive:
 *           type: boolean
 *           description: Whether the subcategory is active
 *           default: true
 *         order:
 *           type: number
 *           description: Display order of the subcategory
 *           default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const express = require('express');
const router = express.Router();
const serviceSubcategoryController = require('../controllers/serviceSubcategoryController');

/**
 * @swagger
 * /user/service-subcategories:
 *   post:
 *     tags: [Service Subcategories]
 *     summary: Create a new service subcategory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceSubcategory'
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSubcategory'
 *       400:
 *         description: Invalid category ID or file type
 *       404:
 *         description: Category not found
 */
router.post('/service-subcategories', serviceSubcategoryController.createSubcategory);

/**
 * @swagger
 * /user/service-subcategories:
 *   get:
 *     tags: [Service Subcategories]
 *     summary: Get all service subcategories
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter subcategories by category ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of service subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceSubcategory'
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
router.get('/service-subcategories', serviceSubcategoryController.getAllSubcategories);

/**
 * @swagger
 * /user/service-subcategories/{id}:
 *   get:
 *     tags: [Service Subcategories]
 *     summary: Get a service subcategory by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The subcategory ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service subcategory found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSubcategory'
 *       400:
 *         description: Invalid subcategory ID
 *       404:
 *         description: Service subcategory not found
 */
router.get('/service-subcategories/:id', serviceSubcategoryController.getSubcategoryById);

/**
 * @swagger
 * /user/service-subcategories/{id}:
 *   put:
 *     tags: [Service Subcategories]
 *     summary: Update a service subcategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The subcategory ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceSubcategory'
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSubcategory'
 *       400:
 *         description: Invalid file type or subcategory not found
 *       404:
 *         description: Subcategory not found
 */
router.put('/service-subcategories/:id', serviceSubcategoryController.updateSubcategory);

/**
 * @swagger
 * /user/service-subcategories/{id}:
 *   delete:
 *     tags: [Service Subcategories]
 *     summary: Delete a service subcategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The subcategory ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Subcategory deleted successfully
 *       400:
 *         description: Invalid subcategory ID or cannot delete subcategory with existing service types
 *       404:
 *         description: Subcategory not found
 */
router.delete('/service-subcategories/:id', serviceSubcategoryController.deleteSubcategory);

/**
 * @swagger
 * /user/service-subcategories/category/{categoryId}:
 *   get:
 *     tags: [Service Subcategories]
 *     summary: Get all subcategories by category ID
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: The category ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of service subcategories for a specific category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceSubcategory'
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
 *         description: Invalid category ID
 */
router.get('/service-subcategories/category/:categoryId', serviceSubcategoryController.getSubcategoriesByCategory);

/**
 * @swagger
 * /user/service-subcategories/search:
 *   get:
 *     tags: [Service Subcategories]
 *     summary: Search for service subcategories
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
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of matching service subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceSubcategory'
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
router.get('/service-subcategories/search', serviceSubcategoryController.searchSubcategories);

/**
 * @swagger
 * /user/service-subcategories/stats:
 *   get:
 *     tags: [Service Subcategories]
 *     summary: Get subcategory statistics
 *     responses:
 *       200:
 *         description: Subcategory statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSubcategories:
 *                   type: integer
 *                   description: Total number of subcategories
 *                 activeSubcategories:
 *                   type: integer
 *                   description: Number of active subcategories
 *                 subcategoriesPerCategory:
 *                   type: object
 *                   description: Distribution of subcategories across categories
 */
router.get('/service-subcategories/stats', serviceSubcategoryController.getSubcategoryStats);

module.exports = router;
