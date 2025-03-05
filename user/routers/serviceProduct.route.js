const express = require('express');
const router = express.Router();
const serviceProductController = require('../controllers/serviceProductController');

/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Service Product API
 *   description: API endpoints for managing service products with vehicle-specific details
 *   version: 1.0.0
 *   contact:
 *     name: API Support
 * tags:
 *   - name: Service Products
 *     description: Operations related to service products
 * 
 * components:
 *   schemas:
 *     ServiceProduct:
 *       type: object
 *       required:
 *         - name
 *         - brand
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: Name of the product
 *         brand:
 *           type: string
 *           description: Brand of the product
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the product
 *         vehicleSpecificProducts:
 *           type: array
 *           description: List of vehicle specific product details
 *           items:
 *             type: object
 *             required:
 *               - serviceVehicleId
 *               - quantity
 *               - providerId
 *               - price
 *             properties:
 *               serviceVehicleId:
 *                 type: string
 *                 description: ID of the service vehicle
 *               quantity:
 *                 type: number
 *                 description: Quantity for this vehicle
 *               providerId:
 *                 type: string
 *                 description: ID of the service provider
 *               price:
 *                 type: number
 *                 description: Price for this vehicle specific product
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the product was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the product was last updated
 *       example:
 *         name: "Oil Filter"
 *         brand: "Bosch"
 *         createdBy: "6457b8e7c71d1234567890ab"
 *         vehicleSpecificProducts: [
 *           {
 *             serviceVehicleId: "6457b8e7c71d1234567890cd",
 *             quantity: 10,
 *             providerId: "6457b8e7c71d1234567890ef",
 *             price: 25.99
 *           }
 *         ]
 */

/**
 * @swagger
 * /user/service-products:
 *   post:
 *     tags: [Service Products]
 *     summary: Create a new service product
 *     description: Create a new service product with vehicle-specific details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - brand
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               brand:
 *                 type: string
 *                 description: Brand of the product
 *               userId:
 *                 type: string
 *                 description: valid user id
 *               vehicleSpecificProducts:
 *                 type: array
 *                 description: List of vehicle specific product details
 *                 items:
 *                   type: object
 *                   required:
 *                     - serviceVehicleId
 *                     - quantity
 *                     - providerId
 *                     - price
 *                   properties:
 *                     serviceVehicleId:
 *                       type: string
 *                       description: ID of the service vehicle
 *                     quantity:
 *                       type: number
 *                       description: Quantity for this vehicle
 *                     providerId:
 *                       type: string
 *                       description: ID of the service provider
 *                     price:
 *                       type: number
 *                       description: Price for this vehicle specific product
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceProduct'
 *       400:
 *         description: Product with this name and brand already exists
 *       500:
 *         description: Internal server error
 */
router.post('/service-products', serviceProductController.createProduct);

/**
 * @swagger
 * /user/service-products:
 *   get:
 *     tags: [Service Products]
 *     summary: Get all service products with filters
 *     description: Retrieve a paginated list of service products with optional brand filter
 *     parameters:
 *       - in: query
 *         name: brand
 *         description: Filter by product brand
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
 *         description: A list of service products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceProduct'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of products
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       500:
 *         description: Internal server error
 */
router.get('/service-products', serviceProductController.getAllProducts);

/**
 * @swagger
 * /user/service-products/{id}:
 *   get:
 *     tags: [Service Products]
 *     summary: Get a service product by ID
 *     description: Retrieve detailed information about a specific service product
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceProduct'
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get('/service-products/:id', serviceProductController.getProductById);

/**
 * @swagger
 * /user/service-products/{id}:
 *   put:
 *     tags: [Service Products]
 *     summary: Update a service product by ID
 *     description: Update an existing service product's information
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
 *                 description: Name of the product
 *               brand:
 *                 type: string
 *                 description: Brand of the product
 *               vehicleSpecificProducts:
 *                 type: array
 *                 description: List of vehicle specific product details
 *                 items:
 *                   type: object
 *                   required:
 *                     - serviceVehicleId
 *                     - quantity
 *                     - providerId
 *                     - price
 *                   properties:
 *                     serviceVehicleId:
 *                       type: string
 *                       description: ID of the service vehicle
 *                     quantity:
 *                       type: number
 *                       description: Quantity for this vehicle
 *                     providerId:
 *                       type: string
 *                       description: ID of the service provider
 *                     price:
 *                       type: number
 *                       description: Price for this vehicle specific product
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceProduct'
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
 * /user/service-products/{id}:
 *   delete:
 *     tags: [Service Products]
 *     summary: Delete a service product by ID
 *     description: Remove a service product from the system
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.delete('/service-products/:id', serviceProductController.deleteProduct);

/**
 * @swagger
 * user/service-products/{id}/stock:
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
 * /user/service-products/search:
 *   get:
 *     tags: [Service Products]
 *     summary: Search for service products
 *     description: Search for products by name or brand with pagination
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Search query string (name or brand)
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
 *         description: A list of matching service products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceProduct'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of matching products
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       500:
 *         description: Internal server error
 */
router.get('/service-products/search', serviceProductController.searchProducts);

/**
 * @swagger
 * user/service-products/low-stock:
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
 * user/service-products/{id}/image/{imageIndex}:
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
