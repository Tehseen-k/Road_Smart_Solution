/**
 * @swagger
 * tags:
 *   name: Service Categories
 *   description: API endpoints for managing service categories
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceCategory:
 *       type: object
 *       required:
 *         - categoryName
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         categoryName:
 *           type: string
 *           description: Name of the service category
 *         description:
 *           type: string
 *           description: Description of the service category
 *         displayOrder:
 *           type: number
 *           description: Order in which the category should be displayed
 *           default: 0
 *         isActive:
 *           type: boolean
 *           description: Whether the category is active
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         categoryName: "Home Services"
 *         description: "All home-related services"
 *         displayOrder: 1
 *         isActive: true
 * 
 *     ServiceCategoryInput:
 *       type: object
 *       required:
 *         - categoryName
 *       properties:
 *         categoryName:
 *           type: string
 *         description:
 *           type: string
 *         displayOrder:
 *           type: number
 *         isActive:
 *           type: boolean
 * 
 *     ServiceCategoryStats:
 *       type: object
 *       properties:
 *         categoryStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subcategoriesCount:
 *                 type: number
 *               serviceTypesCount:
 *                 type: number
 *               averagePrice:
 *                 type: number
 *         popularCategories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               requestCount:
 *                 type: number
 * 
 *     Error:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *         message:
 *           type: string
 *
 * @swagger
 * components:
 *   parameters:
 *     categoryId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: The service category ID
 */

const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/serviceCategoryController');

/**
 * @swagger
 * /user/service-categories:
 *   post:
 *     tags: [Service Categories]
 *     summary: Create a new service category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceCategoryInput'
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: Category icon image (jpg, jpeg, png)
 *     responses:
 *       201:
 *         description: Service category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceCategory'
 *       400:
 *         description: Category with this name already exists or invalid file type for icon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/service-categories', serviceCategoryController.createCategory);

/**
 * @swagger
 * /user/service-categories:
 *   get:
 *     tags: [Service Categories]
 *     summary: Get all service categories
 *     parameters:
 *       - in: query
 *         name: includeSubcategories
 *         schema:
 *           type: boolean
 *         description: Flag to include subcategories in the response
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of service categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceCategory'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/service-categories', serviceCategoryController.getAllCategories);

/**
 * @swagger
 * /user/service-categories/{id}:
 *   get:
 *     tags: [Service Categories]
 *     summary: Get a service category by ID
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     responses:
 *       200:
 *         description: Service category found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   $ref: '#/components/schemas/ServiceCategory'
 *                 subcategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       serviceTypesCount:
 *                         type: integer
 *       400:
 *         description: Invalid category ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/service-categories/:id', serviceCategoryController.getCategoryById);

/**
 * @swagger
 * /user/service-categories/{id}:
 *   put:
 *     tags: [Service Categories]
 *     summary: Update a service category
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceCategoryInput'
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: Category icon image (jpg, jpeg, png)
 *     responses:
 *       200:
 *         description: Service category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceCategory'
 *       400:
 *         description: Invalid category ID or category with the same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/service-categories/:id', serviceCategoryController.updateCategory);

/**
 * @swagger
 * /user/service-categories/{id}:
 *   delete:
 *     tags: [Service Categories]
 *     summary: Delete a service category
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     responses:
 *       204:
 *         description: Service category deleted successfully
 *       400:
 *         description: Cannot delete category with existing subcategories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/service-categories/:id', serviceCategoryController.deleteCategory);

// /**
//  * @swagger
//  * /user/service-categories/reorder:
//  *   put:
//  *     tags: [Service Categories]
//  *     summary: Reorder service categories
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - orders
//  *             properties:
//  *               orders:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   required:
//  *                     - categoryId
//  *                     - order
//  *                   properties:
//  *                     categoryId:
//  *                       type: string
//  *                     order:
//  *                       type: integer
//  *     responses:
//  *       200:
//  *         description: Categories reordered successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/ServiceCategory'
//  *       400:
//  *         description: Invalid order data
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  */
// router.put('/service-categories/reorder', serviceCategoryController.reorderCategories);

// /**
//  * @swagger
//  * /user/service-categories/stats:
//  *   get:
//  *     tags: [Service Categories]
//  *     summary: Get category statistics
//  *     responses:
//  *       200:
//  *         description: Category statistics retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ServiceCategoryStats'
//  *       500:
//  *         description: Internal server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  */
// router.get('/service-categories/stats', serviceCategoryController.getCategoryStats);

module.exports = router;
