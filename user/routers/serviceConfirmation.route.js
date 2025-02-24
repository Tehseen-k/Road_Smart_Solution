const express = require('express');
const router = express.Router();
const serviceConfirmationController = require('../controllers/serviceConfirmationController');

/**
 * @swagger
 * /service-confirmations:
 *   post:
 *     summary: Create a new service confirmation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *               scheduledTime:
 *                 type: string
 *               notes:
 *                 type: string
 *               specialInstructions:
 *                 type: string
 *               estimatedDuration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service confirmation created successfully
 *       400:
 *         description: Invalid request ID or confirmation already exists
 *       500:
 *         description: Internal server error
 */
router.post('/service-confirmations', serviceConfirmationController.createConfirmation);

/**
 * @swagger
 * /service-confirmations/{id}:
 *   get:
 *     summary: Get service confirmation by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service confirmation ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service confirmation found
 *       400:
 *         description: Invalid confirmation ID
 *       404:
 *         description: Service confirmation not found
 */
router.get('/service-confirmations/:id', serviceConfirmationController.getConfirmationById);

/**
 * @swagger
 * /service-confirmations/{id}:
 *   put:
 *     summary: Update a service confirmation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service confirmation ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledDate:
 *                 type: string
 *               scheduledTime:
 *                 type: string
 *               notes:
 *                 type: string
 *               specialInstructions:
 *                 type: string
 *               estimatedDuration:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service confirmation updated successfully
 *       400:
 *         description: Invalid confirmation ID or invalid data
 *       404:
 *         description: Service confirmation not found
 */
router.put('/service-confirmations/:id', serviceConfirmationController.updateConfirmation);

/**
 * @swagger
 * /service-confirmations/{id}:
 *   delete:
 *     summary: Cancel a service confirmation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service confirmation ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service confirmation cancelled successfully
 *       400:
 *         description: Invalid confirmation ID
 *       404:
 *         description: Service confirmation not found
 */
router.delete('/service-confirmations/:id', serviceConfirmationController.cancelConfirmation);

/**
 * @swagger
 * /service-confirmations/{id}/reschedule:
 *   put:
 *     summary: Reschedule a service confirmation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service confirmation ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledDate:
 *                 type: string
 *               scheduledTime:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service confirmation rescheduled successfully
 *       400:
 *         description: Invalid confirmation ID or invalid data
 *       404:
 *         description: Service confirmation not found
 */
router.put('/service-confirmations/:id/reschedule', serviceConfirmationController.rescheduleConfirmation);

/**
 * @swagger
 * /service-confirmations/request/{requestId}:
 *   get:
 *     summary: Get service confirmation by request ID
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         description: The service request ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service confirmation found
 *       400:
 *         description: Invalid request ID
 *       404:
 *         description: Service confirmation not found
 */
router.get('/service-confirmations/request/:requestId', serviceConfirmationController.getRequestConfirmation);

module.exports = router;
