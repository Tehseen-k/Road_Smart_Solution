const ServiceReminder = require('../models/ServiceReminder');
const UserCar = require('../models/UserCar');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');

const serviceReminderController = {
  createReminder: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const userCar = await UserCar.findById(req.body.userCarId);
    if (!userCar) {
      throw new ApiError(404, 'User car not found');
    }

    const reminder = new ServiceReminder({
      userCarId: req.body.userCarId,
      serviceType: req.body.serviceType,
      description: req.body.description,
      dueDate: req.body.dueDate,
      dueKilometers: req.body.dueKilometers,
      priority: req.body.priority || 'normal',
      frequency: req.body.frequency,
      notificationPreference: req.body.notificationPreference || ['email'],
      notes: req.body.notes,
      status: 'pending'
    });

    await reminder.save();

    const populatedReminder = await ServiceReminder.findById(reminder._id)
      .populate('userCarId');

    const response = new ResponseHandler(res);
    return response.created(populatedReminder);
  }),

  getCarReminders: catchAsync(async (req, res) => {
    const { userCarId } = req.params;
    if (!validationHelper.isValidId(userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { status, priority, sortBy } = req.query;

    const query = { userCarId };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let sort = { dueDate: 1 };
    if (sortBy === 'priority') {
      sort = { 
        priority: -1, // high to low
        dueDate: 1 
      };
    }

    const reminders = await ServiceReminder.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userCarId')
      .sort(sort);

    const total = await ServiceReminder.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      reminders,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getReminderById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid reminder ID');
    }

    const reminder = await ServiceReminder.findById(id)
      .populate('userCarId');

    if (!reminder) {
      throw new ApiError(404, 'Service reminder not found');
    }

    const response = new ResponseHandler(res);
    return response.success(reminder);
  }),

  updateReminder: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid reminder ID');
    }

    const reminder = await ServiceReminder.findById(id);
    if (!reminder) {
      throw new ApiError(404, 'Service reminder not found');
    }

    const updatedReminder = await ServiceReminder.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userCarId');

    const response = new ResponseHandler(res);
    return response.success(updatedReminder);
  }),

  deleteReminder: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid reminder ID');
    }

    const reminder = await ServiceReminder.findById(id);
    if (!reminder) {
      throw new ApiError(404, 'Service reminder not found');
    }

    await reminder.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  completeReminder: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid reminder ID');
    }

    const reminder = await ServiceReminder.findById(id);
    if (!reminder) {
      throw new ApiError(404, 'Service reminder not found');
    }

    reminder.status = 'completed';
    reminder.completedAt = Date.now();
    reminder.completionNotes = req.body.notes;
    reminder.actualServiceDate = req.body.serviceDate || Date.now();

    // Create next reminder if frequency is set
    if (reminder.frequency) {
      const nextReminder = new ServiceReminder({
        userCarId: reminder.userCarId,
        serviceType: reminder.serviceType,
        description: reminder.description,
        dueDate: calculateNextDueDate(reminder.frequency, reminder.actualServiceDate),
        dueKilometers: reminder.dueKilometers ? reminder.dueKilometers + calculateNextKilometers(reminder.frequency) : null,
        priority: reminder.priority,
        frequency: reminder.frequency,
        notificationPreference: reminder.notificationPreference,
        notes: reminder.notes,
        previousReminderId: reminder._id,
        status: 'pending'
      });
      await nextReminder.save();
      reminder.nextReminderId = nextReminder._id;
    }

    await reminder.save();

    const response = new ResponseHandler(res);
    return response.success(reminder);
  }),

  snoozeReminder: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid reminder ID');
    }

    const reminder = await ServiceReminder.findById(id);
    if (!reminder) {
      throw new ApiError(404, 'Service reminder not found');
    }

    if (reminder.status !== 'pending') {
      throw new ApiError(400, 'Can only snooze pending reminders');
    }

    const snoozeDays = parseInt(req.body.snoozeDays) || 7;
    reminder.dueDate = new Date(reminder.dueDate.getTime() + (snoozeDays * 24 * 60 * 60 * 1000));
    reminder.snoozeCount = (reminder.snoozeCount || 0) + 1;
    reminder.lastSnoozedAt = Date.now();

    await reminder.save();

    const response = new ResponseHandler(res);
    return response.success(reminder);
  }),

  getDueReminders: catchAsync(async (req, res) => {
    const { days = 7 } = req.query;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(days));

    const reminders = await ServiceReminder.find({
      status: 'pending',
      dueDate: { $lte: dueDate }
    }).populate('userCarId')
      .sort({ dueDate: 1 });

    const response = new ResponseHandler(res);
    return response.success(reminders);
  })
};

// Helper functions
function calculateNextDueDate(frequency, baseDate) {
  const date = new Date(baseDate);
  switch (frequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'semi_annual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid frequency');
  }
  return date;
}

function calculateNextKilometers(frequency) {
  switch (frequency) {
    case 'monthly':
      return 1000;
    case 'quarterly':
      return 3000;
    case 'semi_annual':
      return 6000;
    case 'annual':
      return 12000;
    default:
      return 0;
  }
}

module.exports = serviceReminderController; 