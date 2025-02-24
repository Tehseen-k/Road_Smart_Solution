const express = require('express');
const router = express.Router();
const serviceQuoteController = require('../controllers/serviceQuoteController');

/**
 * @swagger
 * /service-quotes:
 *   post:
 *     summary: Create a new quote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *               providerId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               estimatedTime:
 *                 type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: string
 *               laborCost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Quote submitted successfully
 *       400:
 *         description: Invalid request ID or provider ID, or quote already exists
 *       404:
 *         description: Service request not found
 *       500:
 *         description: Internal server error
 */
router.post('/service-quotes', serviceQuoteController.createQuote);

/**
 * @swagger
 * /service-quotes:
 *   get:
 *     summary: Get all quotes
 *     parameters:
 *       - in: query
 *         name: minAmount
 *         required: false
 *         description: Minimum quote amount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         required: false
 *         description: Maximum quote amount
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of service quotes
 *       500:
 *         description: Internal server error
 */
router.get('/service-quotes', serviceQuoteController.getAllQuotes);

/**
 * @swagger
 * /service-quotes/{id}:
 *   get:
 *     summary: Get a quote by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The quote ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quote found
 *       400:
 *         description: Invalid quote ID
 *       404:
 *         description: Quote not found
 */
router.get('/service-quotes/:id', serviceQuoteController.getQuoteById);

/**
 * @swagger
 * /service-quotes/{id}:
 *   put:
 *     summary: Update a quote
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The quote ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               estimatedTime:
 *                 type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: string
 *               laborCost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Quote updated successfully
 *       400:
 *         description: Invalid quote ID or non-pending quote status
 *       404:
 *         description: Quote not found
 */
router.put('/service-quotes/:id', serviceQuoteController.updateQuote);

/**
 * @swagger
 * /service-quotes/{id}/status:
 *   put:
 *     summary: Update the status of a quote
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The quote ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, expired]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quote status updated successfully
 *       400:
 *         description: Invalid status or non-pending quote
 *       404:
 *         description: Quote not found
 */
router.put('/service-quotes/:id/status', serviceQuoteController.updateQuoteStatus);

/**
 * @swagger
 * /service-quotes/request/{requestId}:
 *   get:
 *     summary: Get quotes for a specific service request
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         description: The service request ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of quotes for the request
 *       400:
 *         description: Invalid request ID
 *       404:
 *         description: No quotes found for the request
 */
router.get('/service-quotes/request/:requestId', serviceQuoteController.getQuotesByRequest);

/**
 * @swagger
 * /service-quotes/provider/{providerId}:
 *   get:
 *     summary: Get quotes submitted by a specific provider
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The provider ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of quotes submitted by the provider
 *       400:
 *         description: Invalid provider ID
 *       404:
 *         description: No quotes found for the provider
 */
router.get('/service-quotes/provider/:providerId', serviceQuoteController.getProviderQuotes);

/**
 * @swagger
 * /service-quotes/stats:
 *   get:
 *     summary: Get quote statistics
 *     responses:
 *       200:
 *         description: Quote statistics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/service-quotes/stats', serviceQuoteController.getQuoteStats);

module.exports = router;
