const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimateController');

/**
 * @swagger
 * /estimates:
 *   post:
 *     summary: Create a new estimate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceRequestId:
 *                 type: string
 *               providerId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               laborCost:
 *                 type: number
 *               partsCost:
 *                 type: number
 *               additionalCosts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     amount:
 *                       type: number
 *               tax:
 *                 type: number
 *               discount:
 *                 type: number
 *               notes:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Estimate created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/estimates', estimateController.createEstimate);

/**
 * @swagger
 * /estimates/{id}:
 *   get:
 *     summary: Get an estimate by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The estimate ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estimate details
 *       404:
 *         description: Estimate not found
 *       500:
 *         description: Internal server error
 */
router.get('/estimates/:id', estimateController.getEstimateById);

/**
 * @swagger
 * /estimates/{id}:
 *   put:
 *     summary: Update estimate details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The estimate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               laborCost:
 *                 type: number
 *               partsCost:
 *                 type: number
 *               additionalCosts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     amount:
 *                       type: number
 *               tax:
 *                 type: number
 *               discount:
 *                 type: number
 *               notes:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Estimate updated successfully
 *       404:
 *         description: Estimate not found
 *       400:
 *         description: Invalid estimate ID or non-pending estimate
 *       500:
 *         description: Internal server error
 */
router.put('/estimates/:id', estimateController.updateEstimate);

/**
 * @swagger
 * /estimates/{id}/accept:
 *   patch:
 *     summary: Accept an estimate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The estimate ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estimate accepted successfully
 *       404:
 *         description: Estimate not found
 *       400:
 *         description: Cannot accept non-pending estimate
 *       500:
 *         description: Internal server error
 */
router.patch('/estimates/:id/accept', estimateController.acceptEstimate);

/**
 * @swagger
 * /estimates/{id}/reject:
 *   patch:
 *     summary: Reject an estimate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The estimate ID
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
 *         description: Estimate rejected successfully
 *       404:
 *         description: Estimate not found
 *       400:
 *         description: Cannot reject non-pending estimate
 *       500:
 *         description: Internal server error
 */
router.patch('/estimates/:id/reject', estimateController.rejectEstimate);

/**
 * @swagger
 * /estimates/request/{requestId}:
 *   get:
 *     summary: Get all estimates for a service request
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         description: The service request ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of estimates for the specified service request
 *       404:
 *         description: No estimates found for the specified request
 *       500:
 *         description: Internal server error
 */
router.get('/estimates/request/:requestId', estimateController.getEstimatesByRequest);

/**
 * @swagger
 * /estimates/provider/{providerId}:
 *   get:
 *     summary: Get all estimates for a specific provider
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The provider ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter estimates by status (pending, accepted, rejected)
 *     responses:
 *       200:
 *         description: A list of estimates for the specified provider
 *       404:
 *         description: No estimates found for the specified provider
 *       500:
 *         description: Internal server error
 */
router.get('/estimates/provider/:providerId', estimateController.getProviderEstimates);

module.exports = router;
