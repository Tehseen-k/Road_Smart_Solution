const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');

/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Create a new service request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               vehicleId:
 *                 type: string
 *               serviceTypeId:
 *                 type: string
 *               description:
 *                 type: string
 *               issueImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Service request created successfully
 *       400:
 *         description: Invalid ID provided or invalid file type
 *       404:
 *         description: Service request not found
 */
router.post('/service-requests', serviceRequestController.createServiceRequest);

/**
 * @swagger
 * /service-requests:
 *   get:
 *     summary: Get all service requests
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of service requests
 *       400:
 *         description: Invalid query parameters
 */
router.get('/service-requests', serviceRequestController.getAllRequests);

/**
 * @swagger
 * /service-requests/{id}:
 *   get:
 *     summary: Get a service request by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service request ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service request found
 *       400:
 *         description: Invalid request ID
 *       404:
 *         description: Service request not found
 */
router.get('/service-requests/:id', serviceRequestController.getRequestById);

/**
 * @swagger
 * /service-requests/{id}/status:
 *   put:
 *     summary: Update the status of a service request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service request ID
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
 *                 enum: [pending, quoted, confirmed, in_progress, completed, cancelled]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service request status updated successfully
 *       400:
 *         description: Invalid status or invalid request ID
 *       404:
 *         description: Service request not found
 */
router.put('/service-requests/:id/status', serviceRequestController.updateRequestStatus);

/**
 * @swagger
 * /service-requests/{requestId}/quote:
 *   post:
 *     summary: Submit a quote for a service request
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         description: The service request ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               estimatedTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quote submitted successfully
 *       400:
 *         description: Invalid ID provided or quote already submitted
 *       404:
 *         description: Service request or provider not found
 */
router.post('/service-requests/:requestId/quote', serviceRequestController.submitQuote);

/**
 * @swagger
 * /service-requests/user/{userId}/history:
 *   get:
 *     summary: Get the service history of a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's service request history
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: No service history found
 */
router.get('/service-requests/user/:userId/history', serviceRequestController.getUserServiceHistory);

/**
 * @swagger
 * /service-requests/stats:
 *   get:
 *     summary: Get service request statistics
 *     responses:
 *       200:
 *         description: Service request statistics
 */
router.get('/service-requests/stats', serviceRequestController.getRequestStats);

module.exports = router;
