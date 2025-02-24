const express = require('express');
const router = express.Router();
const serviceSubcategoryController = require('../controllers/serviceSubcategoryController');

/**
 * @swagger
 * /service-subcategories:
 *   post:
 *     summary: Create a new service subcategory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *       400:
 *         description: Invalid category ID or file type
 *       404:
 *         description: Category not found
 */
router.post('/service-subcategories', serviceSubcategoryController.createSubcategory);

/**
 * @swagger
 * /service-subcategories:
 *   get:
 *     summary: Get all service subcategories
 *     parameters:
 *       - in: query
 *         name: categoryId
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
 *         description: List of service subcategories
 *       400:
 *         description: Invalid query parameters
 */
router.get('/service-subcategories', serviceSubcategoryController.getAllSubcategories);

/**
 * @swagger
 * /service-subcategories/{id}:
 *   get:
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
 *       400:
 *         description: Invalid subcategory ID
 *       404:
 *         description: Service subcategory not found
 */
router.get('/service-subcategories/:id', serviceSubcategoryController.getSubcategoryById);

/**
 * @swagger
 * /service-subcategories/{id}:
 *   put:
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 *       400:
 *         description: Invalid file type or subcategory not found
 *       404:
 *         description: Subcategory not found
 */
router.put('/service-subcategories/:id', serviceSubcategoryController.updateSubcategory);

/**
 * @swagger
 * /service-subcategories/{id}:
 *   delete:
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
 * /service-subcategories/category/{categoryId}:
 *   get:
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of service subcategories for a specific category
 *       400:
 *         description: Invalid category ID
 */
router.get('/service-subcategories/category/:categoryId', serviceSubcategoryController.getSubcategoriesByCategory);

/**
 * @swagger
 * /service-subcategories/search:
 *   get:
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of matching service subcategories
 *       400:
 *         description: Invalid query parameter
 */
router.get('/service-subcategories/search', serviceSubcategoryController.searchSubcategories);

/**
 * @swagger
 * /service-subcategories/stats:
 *   get:
 *     summary: Get subcategory statistics
 *     responses:
 *       200:
 *         description: Subcategory statistics
 */
router.get('/service-subcategories/stats', serviceSubcategoryController.getSubcategoryStats);

module.exports = router;
