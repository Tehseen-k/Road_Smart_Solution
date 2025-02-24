const express = require('express');
const router = express.Router();
const insuranceEstimateController = require('../controllers/insuranceEstimateController');

/**
 * @swagger
 * /insurance-estimates:
 *   post:
 *     summary: Create a new insurance estimate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userCarId:
 *                 type: string
 *               provider:
 *                 type: string
 *               policyType:
 *                 type: string
 *               coverageType:
 *                 type: string
 *               coverageDetails:
 *                 type: string
 *               premium:
 *                 type: object
 *                 properties:
 *                   monthly:
 *                     type: number
 *                   quarterly:
 *                     type: number
 *                   semiAnnual:
 *                     type: number
 *                   annual:
 *                     type: number
 *               deductible:
 *                 type: number
 *               coverageAmount:
 *                 type: number
 *               additionalCoverage:
 *                 type: array
 *                 items:
 *                   type: string
 *               terms:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Insurance estimate created successfully
 *       400:
 *         description: Invalid input or existing active insurance for the car
 *       500:
 *         description: Internal server error
 */
router.post('/insurance-estimates', insuranceEstimateController.createEstimate);

/**
 * @swagger
 * /insurance-estimates/{id}:
 *   get:
 *     summary: Get insurance estimate by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance estimate ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Insurance estimate found
 *       404:
 *         description: Insurance estimate not found
 *       500:
 *         description: Internal server error
 */
router.get('/insurance-estimates/:id', insuranceEstimateController.getEstimateById);

/**
 * @swagger
 * /insurance-estimates/car/{userCarId}:
 *   get:
 *     summary: Get all insurance estimates for a specific car
 *     parameters:
 *       - in: path
 *         name: userCarId
 *         required: true
 *         description: The user car ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of insurance estimates for the car
 *       404:
 *         description: No estimates found for the car
 *       500:
 *         description: Internal server error
 */
router.get('/insurance-estimates/car/:userCarId', insuranceEstimateController.getCarEstimates);

/**
 * @swagger
 * /insurance-estimates/{id}:
 *   put:
 *     summary: Update an insurance estimate by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance estimate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *               policyType:
 *                 type: string
 *               coverageType:
 *                 type: string
 *               coverageDetails:
 *                 type: string
 *               premium:
 *                 type: object
 *                 properties:
 *                   monthly:
 *                     type: number
 *                   quarterly:
 *                     type: number
 *                   semiAnnual:
 *                     type: number
 *                   annual:
 *                     type: number
 *               deductible:
 *                 type: number
 *               coverageAmount:
 *                 type: number
 *               additionalCoverage:
 *                 type: array
 *                 items:
 *                   type: string
 *               terms:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Insurance estimate updated successfully
 *       400:
 *         description: Invalid estimate ID or non-pending status
 *       404:
 *         description: Insurance estimate not found
 *       500:
 *         description: Internal server error
 */
router.put('/insurance-estimates/:id', insuranceEstimateController.updateEstimate);

/**
 * @swagger
 * /insurance-estimates/{id}/accept:
 *   patch:
 *     summary: Accept an insurance estimate and create insurance detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance estimate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               premiumOption:
 *                 type: string
 *                 enum:
 *                   - monthly
 *                   - quarterly
 *                   - semiAnnual
 *                   - annual
 *     responses:
 *       200:
 *         description: Insurance estimate accepted and policy created
 *       400:
 *         description: Invalid estimate ID or non-pending estimate
 *       404:
 *         description: Insurance estimate not found
 *       500:
 *         description: Internal server error
 */
router.patch('/insurance-estimates/:id/accept', insuranceEstimateController.acceptEstimate);

/**
 * @swagger
 * /insurance-estimates/{id}/reject:
 *   patch:
 *     summary: Reject an insurance estimate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance estimate ID
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
 *         description: Insurance estimate rejected
 *       400:
 *         description: Invalid estimate ID or non-pending estimate
 *       404:
 *         description: Insurance estimate not found
 *       500:
 *         description: Internal server error
 */
router.patch('/insurance-estimates/:id/reject', insuranceEstimateController.rejectEstimate);

/**
 * @swagger
 * /insurance-estimates/compare:
 *   post:
 *     summary: Compare multiple insurance estimates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estimateIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Comparison result of the estimates
 *       400:
 *         description: Invalid estimate IDs or insufficient estimates
 *       404:
 *         description: One or more estimates not found
 *       500:
 *         description: Internal server error
 */
router.post('/insurance-estimates/compare', insuranceEstimateController.compareEstimates);

module.exports = router;
