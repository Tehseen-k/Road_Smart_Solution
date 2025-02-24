const express = require('express');
const router = express.Router();
const roadLicenseController = require('../controllers/roadLicenseController');

/**
 * @swagger
 * /road-licenses:
 *   post:
 *     summary: Create a new road license
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userCarId:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               issuedDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               issuingAuthority:
 *                 type: string
 *               type:
 *                 type: string
 *               restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               fees:
 *                 type: number
 *               documentUrl:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: License created successfully
 *       400:
 *         description: Invalid user car ID or license document file
 *       404:
 *         description: User car not found
 */
router.post('/road-licenses', roadLicenseController.createLicense);

/**
 * @swagger
 * /road-licenses/{id}:
 *   get:
 *     summary: Get road license by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The road license ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: License found
 *       400:
 *         description: Invalid license ID
 *       404:
 *         description: License not found
 */
router.get('/road-licenses/:id', roadLicenseController.getLicenseById);

/**
 * @swagger
 * /road-licenses/vehicle/{vehicleId}:
 *   get:
 *     summary: Get all road licenses for a specific vehicle
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         description: The vehicle ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of licenses for the vehicle
 *       400:
 *         description: Invalid vehicle ID
 *       404:
 *         description: No licenses found for this vehicle
 */
router.get('/road-licenses/vehicle/:vehicleId', roadLicenseController.getVehicleLicenses);

/**
 * @swagger
 * /road-licenses/{id}:
 *   put:
 *     summary: Update a road license
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The road license ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licenseNumber:
 *                 type: string
 *               issuedDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               issuingAuthority:
 *                 type: string
 *               type:
 *                 type: string
 *               restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               fees:
 *                 type: number
 *               documentUrl:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: License updated successfully
 *       400:
 *         description: Invalid file type or license ID
 *       404:
 *         description: License not found
 */
router.put('/road-licenses/:id', roadLicenseController.updateLicense);

/**
 * @swagger
 * /road-licenses/{id}/renew:
 *   put:
 *     summary: Renew an expired license
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The road license ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licenseNumber:
 *                 type: string
 *               issuedDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               issuingAuthority:
 *                 type: string
 *               restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               fees:
 *                 type: number
 *               documentUrl:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: License renewed successfully
 *       400:
 *         description: Invalid license ID or file type
 *       404:
 *         description: License not found
 */
router.put('/road-licenses/:id/renew', roadLicenseController.renewLicense);

/**
 * @swagger
 * /road-licenses/{id}/cancel:
 *   put:
 *     summary: Cancel a road license
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The road license ID
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
 *         description: License cancelled successfully
 *       400:
 *         description: Invalid license ID or reason
 *       404:
 *         description: License not found
 */
router.put('/road-licenses/:id/cancel', roadLicenseController.cancelLicense);

/**
 * @swagger
 * /road-licenses/status/{licenseNumber}:
 *   get:
 *     summary: Check the status of a road license by license number
 *     parameters:
 *       - in: path
 *         name: licenseNumber
 *         required: true
 *         description: The road license number
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: License status
 *       404:
 *         description: License not found
 */
router.get('/road-licenses/status/:licenseNumber', roadLicenseController.checkLicenseStatus);

module.exports = router;
