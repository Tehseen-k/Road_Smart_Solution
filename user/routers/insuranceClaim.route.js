const express = require('express');
const router = express.Router();
const insuranceClaimController = require('../controllers/insuranceClaimController');

/**
 * @swagger
 * /claims:
 *   post:
 *     summary: Create a new claim
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userCarId:
 *                 type: string
 *               insuranceDocId:
 *                 type: string
 *               claimType:
 *                 type: string
 *               incidentDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               estimatedAmount:
 *                 type: number
 *               thirdPartyInvolved:
 *                 type: boolean
 *               thirdPartyDetails:
 *                 type: string
 *     responses:
 *       201:
 *         description: Claim created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/claims', insuranceClaimController.createClaim);

/**
 * @swagger
 * /claims/{id}:
 *   get:
 *     summary: Get a claim by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The claim ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim details
 *       404:
 *         description: Claim not found
 *       500:
 *         description: Internal server error
 */
router.get('/claims/:id', insuranceClaimController.getClaimById);

/**
 * @swagger
 * /claims/{id}:
 *   put:
 *     summary: Update claim details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The claim ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               claimType:
 *                 type: string
 *               incidentDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               estimatedAmount:
 *                 type: number
 *               thirdPartyInvolved:
 *                 type: boolean
 *               thirdPartyDetails:
 *                 type: string
 *     responses:
 *       200:
 *         description: Claim updated successfully
 *       404:
 *         description: Claim not found
 *       500:
 *         description: Internal server error
 */
router.put('/claims/:id', insuranceClaimController.updateClaim);

/**
 * @swagger
 * /claims/{id}/status:
 *   patch:
 *     summary: Update claim status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The claim ID
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
 *                 enum: [approved, denied, pending]
 *               statusNote:
 *                 type: string
 *               approvedAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               paymentDetails:
 *                 type: string
 *     responses:
 *       200:
 *         description: Claim status updated successfully
 *       400:
 *         description: Invalid claim status or input
 *       404:
 *         description: Claim not found
 *       500:
 *         description: Internal server error
 */
router.patch('/claims/:id/status', insuranceClaimController.updateClaimStatus);

/**
 * @swagger
 * /claims/vehicle/{userCarId}:
 *   get:
 *     summary: Get all claims for a specific vehicle
 *     parameters:
 *       - in: path
 *         name: userCarId
 *         required: true
 *         description: The user's car ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter claims by status
 *     responses:
 *       200:
 *         description: A list of claims for the specified vehicle
 *       404:
 *         description: No claims found for the specified vehicle
 *       500:
 *         description: Internal server error
 */
router.get('/claims/vehicle/:userCarId', insuranceClaimController.getVehicleClaims);

/**
 * @swagger
 * /claims/{id}/documents:
 *   post:
 *     summary: Add a document to an existing claim
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The claim ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documentType:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document added to the claim successfully
 *       400:
 *         description: Invalid input data or missing file
 *       404:
 *         description: Claim not found
 *       500:
 *         description: Internal server error
 */
router.post('/claims/:id/documents', insuranceClaimController.addClaimDocument);

/**
 * @swagger
 * /claims/{id}/documents/{documentId}:
 *   delete:
 *     summary: Remove a document from a claim
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The claim ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: documentId
 *         required: true
 *         description: The document ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document removed from the claim successfully
 *       404:
 *         description: Claim or document not found
 *       500:
 *         description: Internal server error
 */
router.delete('/claims/:id/documents/:documentId', insuranceClaimController.removeClaimDocument);

module.exports = router;
