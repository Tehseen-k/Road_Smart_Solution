const express = require('express');
const router = express.Router();
const serviceReminderController = require('../controllers/serviceReminderController');

/**
 * @swagger
 * /service-reminders:
 *   post:
 *     summary: Create a new service reminder
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userCarId:
 *                 type: string
 *               serviceType:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               dueKilometers:
 *                 type: number
 *               priority:
 *                 type: string
 *               frequency:
 *                 type: string
 *               notificationPreference:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service reminder created successfully
 *       400:
 *         description: Invalid user car ID or invalid input
 *       404:
 *         description: User car not found
 */
router.post('/service-reminders', serviceReminderController.createReminder);

/**
 * @swagger
 * /service-reminders/{userCarId}:
 *   get:
 *     summary: Get all service reminders for a specific car
 *     parameters:
 *       - in: path
 *         name: userCarId
 *         required: true
 *         description: The user car ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of service reminders for the car
 *       400:
 *         description: Invalid user car ID
 *       404:
 *         description: No reminders found for this car
 */
router.get('/service-reminders/:userCarId', serviceReminderController.getCarReminders);

/**
 * @swagger
 * /service-reminders/{id}:
 *   get:
 *     summary: Get a service reminder by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service reminder ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service reminder found
 *       400:
 *         description: Invalid reminder ID
 *       404:
 *         description: Service reminder not found
 */
router.get('/service-reminders/:id', serviceReminderController.getReminderById);

/**
 * @swagger
 * /service-reminders/{id}:
 *   put:
 *     summary: Update a service reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service reminder ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceType:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               dueKilometers:
 *                 type: number
 *               priority:
 *                 type: string
 *               frequency:
 *                 type: string
 *               notificationPreference:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service reminder updated successfully
 *       400:
 *         description: Invalid reminder ID or invalid input
 *       404:
 *         description: Service reminder not found
 */
router.put('/service-reminders/:id', serviceReminderController.updateReminder);

/**
 * @swagger
 * /service-reminders/{id}:
 *   delete:
 *     summary: Delete a service reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service reminder ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Service reminder deleted successfully
 *       400:
 *         description: Invalid reminder ID
 *       404:
 *         description: Service reminder not found
 */
router.delete('/service-reminders/:id', serviceReminderController.deleteReminder);

/**
 * @swagger
 * /service-reminders/{id}/complete:
 *   put:
 *     summary: Complete a service reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service reminder ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               serviceDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Service reminder completed successfully
 *       400:
 *         description: Invalid reminder ID or invalid input
 *       404:
 *         description: Service reminder not found
 */
router.put('/service-reminders/:id/complete', serviceReminderController.completeReminder);

/**
 * @swagger
 * /service-reminders/{id}/snooze:
 *   put:
 *     summary: Snooze a service reminder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The service reminder ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               snoozeDays:
 *                 type: number
 *     responses:
 *       200:
 *         description: Service reminder snoozed successfully
 *       400:
 *         description: Invalid reminder ID or invalid input
 *       404:
 *         description: Service reminder not found
 */
router.put('/service-reminders/:id/snooze', serviceReminderController.snoozeReminder);

/**
 * @swagger
 * /service-reminders/due:
 *   get:
 *     summary: Get due service reminders
 *     parameters:
 *       - in: query
 *         name: days
 *         required: false
 *         description: Number of days to check for due reminders
 *         schema:
 *           type: number
 *           default: 7
 *     responses:
 *       200:
 *         description: List of due service reminders
 *       404:
 *         description: No due reminders found
 */
router.get('/service-reminders/due', serviceReminderController.getDueReminders);

module.exports = router;
