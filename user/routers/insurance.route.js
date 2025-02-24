const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');

/**
 * @swagger
 * /insurances:
 *   post:
 *     summary: Create a new insurance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               providerId:
 *                 type: string
 *               vehicleId:
 *                 type: string
 *               insuranceTypeId:
 *                 type: string
 *               policyNumber:
 *                 type: string
 *               sumInsured:
 *                 type: number
 *               premiumAmount:
 *                 type: number
 *               coverageDetails:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, expired, cancelled]
 *     responses:
 *       201:
 *         description: Insurance created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/insurances', insuranceController.createInsurance);

/**
 * @swagger
 * /insurances:
 *   get:
 *     summary: Get all insurances with optional filters
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by insurance status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: A list of insurance records
 *       500:
 *         description: Internal server error
 */
router.get('/insurances', insuranceController.getAllInsurances);

/**
 * @swagger
 * /insurances/{id}:
 *   get:
 *     summary: Get insurance by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The insurance details
 *       404:
 *         description: Insurance not found
 *       500:
 *         description: Internal server error
 */
router.get('/insurances/:id', insuranceController.getInsuranceById);

/**
 * @swagger
 * /insurances/{id}:
 *   put:
 *     summary: Update insurance by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               providerId:
 *                 type: string
 *               vehicleId:
 *                 type: string
 *               insuranceTypeId:
 *                 type: string
 *               policyNumber:
 *                 type: string
 *               sumInsured:
 *                 type: number
 *               premiumAmount:
 *                 type: number
 *               coverageDetails:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, expired, cancelled]
 *     responses:
 *       200:
 *         description: Insurance updated successfully
 *       404:
 *         description: Insurance not found
 *       500:
 *         description: Internal server error
 */
router.put('/insurances/:id', insuranceController.updateInsurance);

/**
 * @swagger
 * /insurances/{id}:
 *   delete:
 *     summary: Delete insurance by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Insurance deleted successfully
 *       404:
 *         description: Insurance not found
 *       500:
 *         description: Internal server error
 */
router.delete('/insurances/:id', insuranceController.deleteInsurance);

module.exports = router;
