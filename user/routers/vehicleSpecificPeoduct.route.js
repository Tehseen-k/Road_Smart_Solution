const express = require('express');
const router = express.Router();
const vehicleSpecialProductController = require('../controllers/vehicleSpecialProductController');

/**
 * @swagger
 * /vehicle-special-products:
 *   post:
 *     summary: Create a new vehicle special product
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
 *               manufacturer:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *               compatibleModels:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     make:
 *                       type: string
 *                     model:
 *                       type: string
 *                     year:
 *                       type: integer
 *               price:
 *                 type: number
 *                 format: float
 *               stockQuantity:
 *                 type: integer
 *               minStockLevel:
 *                 type: integer
 *               warrantyInfo:
 *                 type: string
 *               installationGuide:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Product with this name and manufacturer already exists
 *       500:
 *         description: Internal server error
 */
router.post('/vehicle-special-products', vehicleSpecialProductController.createProduct);

/**
 * @swagger
 * /vehicle-special-products:
 *   get:
 *     summary: Get all vehicle special products with filters
 *     parameters:
 *       - in: query
 *         name: category
 *         description: Filter by product category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         description: Filter by product type
 *         schema:
 *           type: string
 *       - in: query
 *         name: manufacturer
 *         description: Filter by product manufacturer
 *         schema:
 *           type: string
 *       - in: query
 *         name: inStock
 *         description: Filter by stock availability (true/false)
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         description: Sort by specific fields (price, name, stock)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of vehicle special products
 *       500:
 *         description: Internal server error
 */
router.get('/vehicle-special-products', vehicleSpecialProductController.getAllProducts);

/**
 * @swagger
 * /vehicle-special-products/{id}:
 *   get:
 *     summary: Get a vehicle special product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get('/vehicle-special-products/:id', vehicleSpecialProductController.getProductById);

/**
 * @swagger
 * /vehicle-special-products/{id}:
 *   put:
 *     summary: Update a vehicle special product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
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
 *               manufacturer:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               stockQuantity:
 *                 type: integer
 *               minStockLevel:
 *                 type: integer
 *               warrantyInfo:
 *                 type: string
 *               installationGuide:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/vehicle-special-products/:id', vehicleSpecialProductController.updateProduct);

/**
 * @swagger
 * /vehicle-special-products/{id}:
 *   delete:
 *     summary: Delete a vehicle special product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.delete('/vehicle-special-products/:id', vehicleSpecialProductController.deleteProduct);

/**
 * @swagger
 * /vehicle-special-products/{id}/stock:
 *   put:
 *     summary: Update stock for a vehicle special product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adjustment:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Invalid product ID or insufficient stock
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/vehicle-special-products/:id/stock', vehicleSpecialProductController.updateStock);

/**
 * @swagger
 * /vehicle-special-products/compatible:
 *   get:
 *     summary: Get compatible products based on make, model, and year
 *     parameters:
 *       - in: query
 *         name: make
 *         required: true
 *         description: The car make
 *         schema:
 *           type: string
 *       - in: query
 *         name: model
 *         required: true
 *         description: The car model
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         description: The car year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of compatible products
 *       500:
 *         description: Internal server error
 */
router.get('/vehicle-special-products/compatible', vehicleSpecialProductController.getCompatibleProducts);

/**
 * @swagger
 * /vehicle-special-products/search:
 *   get:
 *     summary: Search for vehicle special products
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query string (name, description, manufacturer, etc.)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching vehicle special products
 *       500:
 *         description: Internal server error
 */
router.get('/vehicle-special-products/search', vehicleSpecialProductController.searchProducts);

module.exports = router;
