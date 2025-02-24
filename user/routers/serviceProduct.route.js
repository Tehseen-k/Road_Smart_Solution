const express = require('express');
const router = express.Router();
const serviceProductController = require('../controllers/serviceProductController');

/**
 * @swagger
 * /service-products:
 *   post:
 *     summary: Create a new service product
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
 *               brand:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               unit:
 *                 type: string
 *               stockQuantity:
 *                 type: integer
 *               minStockLevel:
 *                 type: integer
 *               specifications:
 *                 type: object
 *               usage:
 *                 type: array
 *                 items:
 *                   type: string
 *               safetyInfo:
 *                 type: array
 *                 items:
 *                   type: string
 *               warrantyInfo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Product with this name and brand already exists
 *       500:
 *         description: Internal server error
 */
router.post('/service-products', serviceProductController.createProduct);

/**
 * @swagger
 * /service-products:
 *   get:
 *     summary: Get all service products with filters
 *     parameters:
 *       - in: query
 *         name: category
 *         description: Filter by product category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         description: Filter by product brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: inStock
 *         description: Filter by stock availability (true/false)
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         description: Filter by product status
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         description: Sort by specific fields (price, name, stock)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of service products
 *       500:
 *         description: Internal server error
 */
router.get('/service-products', serviceProductController.getAllProducts);

/**
 * @swagger
 * /service-products/{id}:
 *   get:
 *     summary: Get a service product by ID
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
router.get('/service-products/:id', serviceProductController.getProductById);

/**
 * @swagger
 * /service-products/{id}:
 *   put:
 *     summary: Update a service product by ID
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
 *               brand:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               unit:
 *                 type: string
 *               stockQuantity:
 *                 type: integer
 *               minStockLevel:
 *                 type: integer
 *               specifications:
 *                 type: object
 *               usage:
 *                 type: array
 *                 items:
 *                   type: string
 *               safetyInfo:
 *                 type: array
 *                 items:
 *                   type: string
 *               warrantyInfo:
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
router.put('/service-products/:id', serviceProductController.updateProduct);

/**
 * @swagger
 * /service-products/{id}:
 *   delete:
 *     summary: Delete a service product by ID
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
router.delete('/service-products/:id', serviceProductController.deleteProduct);

/**
 * @swagger
 * /service-products/{id}/stock:
 *   put:
 *     summary: Update stock for a service product by ID
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
router.put('/service-products/:id/stock', serviceProductController.updateStock);

/**
 * @swagger
 * /service-products/search:
 *   get:
 *     summary: Search for service products
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query string (name, description, brand, etc.)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching service products
 *       500:
 *         description: Internal server error
 */
router.get('/service-products/search', serviceProductController.searchProducts);

/**
 * @swagger
 * /service-products/low-stock:
 *   get:
 *     summary: Get products with low stock
 *     responses:
 *       200:
 *         description: A list of low stock products
 *       500:
 *         description: Internal server error
 */
router.get('/service-products/low-stock', serviceProductController.getLowStockProducts);

/**
 * @swagger
 * /service-products/{id}/image/{imageIndex}:
 *   delete:
 *     summary: Remove a product image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageIndex
 *         required: true
 *         description: Index of the image to be deleted
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: Invalid product ID or image index
 *       404:
 *         description: Product or image not found
 */
router.delete('/service-products/:id/image/:imageIndex', serviceProductController.removeProductImage);

module.exports = router;
