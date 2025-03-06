const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/serviceVehicleController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceVehicle:
 *       type: object
 *       required:
 *         - name
 *         - make
 *         - model
 *         - year
 *         - vehicleType
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the vehicle
 *         make:
 *           type: string
 *           description: Make of the vehicle
 *         model:
 *           type: string
 *           description: Model of the vehicle
 *         year:
 *           type: string
 *           description: Year of the vehicle
 *         vehicleType:
 *           type: string
 *           enum: [Sedan, SUV]
 *           description: Type of the vehicle
 *         createdBy:
 *           type: string
 *           description: User ID who created the vehicle
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all service vehicles
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of all vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceVehicle'
 */
router.get('/', getAllVehicles);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by id
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Vehicle id
 *     responses:
 *       200:
 *         description: Vehicle found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceVehicle'
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id', getVehicleById);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceVehicle'
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', createVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Vehicle id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceVehicle'
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found
 */
router.put('/:id', updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Vehicle id
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 */
router.delete('/:id', deleteVehicle);

module.exports = router; 