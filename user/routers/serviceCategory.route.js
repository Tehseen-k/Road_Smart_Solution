const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/serviceCategoryController');

/**
 * @swagger
 * /service-categories:
 *   post:
 *     summary: Create a new service category
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
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Service category created successfully
 *       400:
 *         description: Category with this name already exists or invalid file type for icon
 *       500:
 *         description: Internal server error
 */
router.post('/service-categories', serviceCategoryController.createCategory);

/**
 * @swagger
 * /service-categories:
 *   get:
 *     summary: Get all service categories
 *     parameters:
 *       - in: query
 *         name: includeSubcategories
 *         required: false
 *         description: Flag to include subcategories in the response
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         required: false
 *         description: Query to filter categories
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of service categories
 *       500:
 *         description: Internal server error
 */
router.get('/service-categories', serviceCategoryController.getAllCategories);

/**
 * @swagger
 * /service-categories/{id}:
 *   get:
 *     summary: Get a service category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service category found
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Service category not found
 */
router.get('/service-categories/:id', serviceCategoryController.getCategoryById);

/**
 * @swagger
 * /service-categories/{id}:
 *   put:
 *     summary: Update a service category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service category ID
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
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Service category updated successfully
 *       400:
 *         description: Invalid category ID or category with the same name already exists
 *       404:
 *         description: Service category not found
 */
router.put('/service-categories/:id', serviceCategoryController.updateCategory);

/**
 * @swagger
 * /service-categories/{id}:
 *   delete:
 *     summary: Delete a service category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service category deleted successfully
 *       400:
 *         description: Cannot delete category with existing subcategories
 *       404:
 *         description: Service category not found
 */
router.delete('/service-categories/:id', serviceCategoryController.deleteCategory);

/**
 * @swagger
 * /service-categories/reorder:
 *   put:
 *     summary: Reorder service categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     categoryId:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Categories reordered successfully
 *       400:
 *         description: Invalid order data
 */
router.put('/service-categories/reorder', serviceCategoryController.reorderCategories);

/**
 * @swagger
 * /service-categories/stats:
 *   get:
 *     summary: Get category statistics
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/service-categories/stats', serviceCategoryController.getCategoryStats);

module.exports = router;
