const express = require('express');
const router = express.Router();
const carPartOrderController = require('../controllers/carPartOrderController');
const upload = require('../../utils/upload'); // Assuming you have a file upload middleware

/**
 * @swagger
 * tags:
 *   name: Car Part Orders
 *   description: Car part order management
 */

/**
 * @swagger
 * /car-part/orders:
 *   post:
 *     summary: Create a new car part order
 *     tags: [Car Part Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     partId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439012"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *               shippingAddress:
 *                 type: string
 *                 example: "123 Main St, Springfield, IL, 62701"
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', upload.array('documents'), carPartOrderController.createOrder);

/**
 * @swagger
 * /car-part/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Car Part Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         example: "2023-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         example: "2023-12-31"
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         example: 50
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         example: 500
 *     responses:
 *       200:
 *         description: List of orders
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', carPartOrderController.getAllOrders);

/**
 * @swagger
 * /car-part/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Car Part Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', carPartOrderController.getOrderById);

/**
 * @swagger
 * /car-part/orders/{id}:
 *   patch:
 *     summary: Update an order's status
 *     tags: [Car Part Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "Shipped"
 *               trackingNumber:
 *                 type: string
 *                 example: "1Z12345E0205271688"
 *               remarks:
 *                 type: string
 *                 example: "Delayed due to weather conditions."
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 */
router.patch('/:id', carPartOrderController.updateOrderStatus);

/**
 * @swagger
 * /car-part/orders/user/{userId}:
 *   get:
 *     summary: Get a user's order history
 *     tags: [Car Part Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of user's orders
 *       400:
 *         description: Invalid user ID
 */
router.get('/user/:userId', carPartOrderController.getUserOrders);

/**
 * @swagger
 * /car-part/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Car Part Orders]
 *     responses:
 *       200:
 *         description: Order statistics
 */
router.get('/stats', carPartOrderController.getOrderStats);

module.exports = router;