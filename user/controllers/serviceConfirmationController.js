const ServiceConfirmation = require('../models/ServiceConfirmation');
const ServiceRequest = require('../models/ServiceRequest');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const fileHandler = require('../utils/fileHandler');

const serviceConfirmationController = {
  createConfirmation: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.requestId)) {
      throw new ApiError(400, 'Invalid request ID');
    }

    const existingConfirmation = await ServiceConfirmation.findOne({
      requestId: req.body.requestId
    });

    if (existingConfirmation) {
      throw new ApiError(400, 'Confirmation already exists for this request');
    }

    const confirmation = new ServiceConfirmation({
      requestId: req.body.requestId,
      confirmedBy: req.user.id,
      confirmedAt: Date.now(),
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime,
      notes: req.body.notes,
      specialInstructions: req.body.specialInstructions,
      estimatedDuration: req.body.estimatedDuration,
      status: 'confirmed'
    });

    await confirmation.save();

    // Update service request status
    await ServiceRequest.findByIdAndUpdate(req.body.requestId, {
      status: 'confirmed',
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime
    });

    const populatedConfirmation = await ServiceConfirmation.findById(confirmation._id)
      .populate('requestId')
      .populate('confirmedBy', 'name email');

    const response = new ResponseHandler(res);
    return response.created(populatedConfirmation);
  }),

  getConfirmationById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid confirmation ID');
    }

    const confirmation = await ServiceConfirmation.findById(id)
      .populate('requestId')
      .populate('confirmedBy', 'name email');

    if (!confirmation) {
      throw new ApiError(404, 'Service confirmation not found');
    }

    const response = new ResponseHandler(res);
    return response.success(confirmation);
  }),

  updateConfirmation: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid confirmation ID');
    }

    const confirmation = await ServiceConfirmation.findById(id);
    if (!confirmation) {
      throw new ApiError(404, 'Service confirmation not found');
    }

    // Update service request if schedule changes
    if (req.body.scheduledDate || req.body.scheduledTime) {
      await ServiceRequest.findByIdAndUpdate(confirmation.requestId, {
        scheduledDate: req.body.scheduledDate || confirmation.scheduledDate,
        scheduledTime: req.body.scheduledTime || confirmation.scheduledTime
      });
    }

    const updatedConfirmation = await ServiceConfirmation.findByIdAndUpdate(
      id,
      {
        ...req.body,
        lastModifiedAt: Date.now(),
        lastModifiedBy: req.user.id
      },
      { new: true, runValidators: true }
    )
      .populate('requestId')
      .populate('confirmedBy', 'name email');

    const response = new ResponseHandler(res);
    return response.success(updatedConfirmation);
  }),

  cancelConfirmation: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid confirmation ID');
    }

    const confirmation = await ServiceConfirmation.findById(id);
    if (!confirmation) {
      throw new ApiError(404, 'Service confirmation not found');
    }

    confirmation.status = 'cancelled';
    confirmation.cancellationReason = req.body.reason;
    confirmation.cancelledAt = Date.now();
    confirmation.cancelledBy = req.user.id;
    await confirmation.save();

    // Update service request status
    await ServiceRequest.findByIdAndUpdate(confirmation.requestId, {
      status: 'cancelled'
    });

    const response = new ResponseHandler(res);
    return response.success(confirmation);
  }),

  rescheduleConfirmation: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid confirmation ID');
    }

    const confirmation = await ServiceConfirmation.findById(id);
    if (!confirmation) {
      throw new ApiError(404, 'Service confirmation not found');
    }

    if (confirmation.status !== 'confirmed') {
      throw new ApiError(400, 'Can only reschedule confirmed services');
    }

    confirmation.scheduledDate = req.body.scheduledDate;
    confirmation.scheduledTime = req.body.scheduledTime;
    confirmation.rescheduledAt = Date.now();
    confirmation.rescheduledBy = req.user.id;
    confirmation.reschedulingReason = req.body.reason;
    await confirmation.save();

    // Update service request schedule
    await ServiceRequest.findByIdAndUpdate(confirmation.requestId, {
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime
    });

    const response = new ResponseHandler(res);
    return response.success(confirmation);
  }),

  getRequestConfirmation: catchAsync(async (req, res) => {
    const { requestId } = req.params;
    if (!validationHelper.isValidId(requestId)) {
      throw new ApiError(400, 'Invalid request ID');
    }

    const confirmation = await ServiceConfirmation.findOne({ requestId })
      .populate('requestId')
      .populate('confirmedBy', 'name email');

    if (!confirmation) {
      throw new ApiError(404, 'Service confirmation not found');
    }

    const response = new ResponseHandler(res);
    return response.success(confirmation);
  })
};

module.exports = serviceConfirmationController; 