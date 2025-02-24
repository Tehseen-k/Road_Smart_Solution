const express = require('express');
const router = express.Router();
const insuranceDetailController = require('../controllers/insuranceDetailController');

/**
 * @swagger
 * /insurance-details:
 *   post:
 *     summary: Create new insurance detail for a car
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
 *               policyNumber:
 *                 type: string
 *               policyType:
 *                 type: string
 *               coverageType:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               premium:
 *                 type: number
 *               deductible:
 *                 type: number
 *               coverageAmount:
 *                 type: number
 *               additionalCoverage:
 *                 type: array
 *                 items:
 *                   type: string
 *               beneficiaries:
 *                 type: array
 *                 items:
 *                   type: string
 *               terms:
 *                 type: string
 *     responses:
 *       201:
 *         description: Insurance detail created successfully
 *       400:
 *         description: Invalid input or active insurance already exists
 *       500:
 *         description: Internal server error
 */
router.post('/insurance-details', insuranceDetailController.createInsuranceDetail);

/**
 * @swagger
 * /insurance-details/{id}:
 *   get:
 *     summary: Get insurance detail by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance detail ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Insurance detail found
 *       404:
 *         description: Insurance detail not found
 *       500:
 *         description: Internal server error
 */
router.get('/insurance-details/:id', insuranceDetailController.getInsuranceById);

/**
 * @swagger
 * /insurance-details/car/{userCarId}:
 *   get:
 *     summary: Get insurance history for a specific car
 *     parameters:
 *       - in: path
 *         name: userCarId
 *         required: true
 *         description: The user car ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of insurance details for the car
 *       404:
 *         description: No insurance details found
 *       500:
 *         description: Internal server error
 */
router.get('/insurance-details/car/:userCarId', insuranceDetailController.getCarInsuranceHistory);

/**
 * @swagger
 * /insurance-details/{id}:
 *   put:
 *     summary: Update insurance details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance detail ID
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
 *               policyNumber:
 *                 type: string
 *               policyType:
 *                 type: string
 *               coverageType:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               premium:
 *                 type: number
 *               deductible:
 *                 type: number
 *               coverageAmount:
 *                 type: number
 *               additionalCoverage:
 *                 type: array
 *                 items:
 *                   type: string
 *               beneficiaries:
 *                 type: array
 *                 items:
 *                   type: string
 *               terms:
 *                 type: string
 *     responses:
 *       200:
 *         description: Insurance details updated successfully
 *       400:
 *         description: Invalid insurance ID or status
 *       404:
 *         description: Insurance detail not found
 *       500:
 *         description: Internal server error
 */
router.put('/insurance-details/:id', insuranceDetailController.updateInsurance);

/**
 * @swagger
 * /insurance-details/{id}/renew:
 *   patch:
 *     summary: Renew insurance policy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance detail ID
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
 *               policyNumber:
 *                 type: string
 *               coverageType:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               premium:
 *                 type: number
 *               deductible:
 *                 type: number
 *               coverageAmount:
 *                 type: number
 *               additionalCoverage:
 *                 type: array
 *                 items:
 *                   type: string
 *               beneficiaries:
 *                 type: array
 *                 items:
 *                   type: string
 *               terms:
 *                 type: string
 *     responses:
 *       200:
 *         description: Insurance renewed successfully
 *       400:
 *         description: Invalid insurance ID or input
 *       404:
 *         description: Insurance not found
 *       500:
 *         description: Internal server error
 */
router.patch('/insurance-details/:id/renew', insuranceDetailController.renewInsurance);

/**
 * @swagger
 * /insurance-details/{id}/cancel:
 *   patch:
 *     summary: Cancel insurance policy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance detail ID
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
 *         description: Insurance cancelled successfully
 *       400:
 *         description: Invalid insurance ID or non-active insurance
 *       404:
 *         description: Insurance not found
 *       500:
 *         description: Internal server error
 */
router.patch('/insurance-details/:id/cancel', insuranceDetailController.cancelInsurance);

/**
 * @swagger
 * /insurance-details/{id}/document:
 *   post:
 *     summary: Add a document to an insurance policy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The insurance detail ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document added successfully
 *       400:
 *         description: Invalid file type or missing document
 *       404:
 *         description: Insurance detail not found
 *       500:
 *         description: Internal server error
 */
router.post('/insurance-details/:id/document', insuranceDetailController.addDocument);

module.exports = router;
