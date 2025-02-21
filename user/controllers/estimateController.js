const Estimate = require('../models/Estimate');
const ServiceRequest = require('../models/ServiceRequest');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');

const estimateController = {
  createEstimate: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.serviceRequestId)) {
      throw new ApiError(400, 'Invalid service request ID');
    }

    const existingEstimate = await Estimate.findOne({
      serviceRequestId: req.body.serviceRequestId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingEstimate) {
      throw new ApiError(400, 'Active estimate already exists for this service request');
    }

    const estimate = new Estimate({
      serviceRequestId: req.body.serviceRequestId,
      providerId: req.body.providerId,
      items: req.body.items,
      laborCost: req.body.laborCost,
      partsCost: req.body.partsCost,
      additionalCosts: req.body.additionalCosts || [],
      tax: req.body.tax,
      discount: req.body.discount,
      notes: req.body.notes,
      validUntil: req.body.validUntil
    });

    estimate.totalAmount = calculateTotalAmount(estimate);
    await estimate.save();

    await ServiceRequest.findByIdAndUpdate(req.body.serviceRequestId, {
      currentEstimate: estimate._id,
      estimateStatus: 'pending'
    });

    const populatedEstimate = await Estimate.findById(estimate._id)
      .populate('serviceRequestId')
      .populate('providerId');

    const response = new ResponseHandler(res);
    return response.created(populatedEstimate);
  }),

  getEstimateById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid estimate ID');
    }

    const estimate = await Estimate.findById(id)
      .populate('serviceRequestId')
      .populate('providerId');

    if (!estimate) {
      throw new ApiError(404, 'Estimate not found');
    }

    const response = new ResponseHandler(res);
    return response.success(estimate);
  }),

  updateEstimate: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid estimate ID');
    }

    const estimate = await Estimate.findById(id);
    if (!estimate) {
      throw new ApiError(404, 'Estimate not found');
    }

    if (estimate.status !== 'pending') {
      throw new ApiError(400, 'Cannot update non-pending estimate');
    }

    Object.assign(estimate, req.body);
    estimate.totalAmount = calculateTotalAmount(estimate);
    await estimate.save();

    const populatedEstimate = await Estimate.findById(estimate._id)
      .populate('serviceRequestId')
      .populate('providerId');

    const response = new ResponseHandler(res);
    return response.success(populatedEstimate);
  }),

  acceptEstimate: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid estimate ID');
    }

    const estimate = await Estimate.findById(id);
    if (!estimate) {
      throw new ApiError(404, 'Estimate not found');
    }

    if (estimate.status !== 'pending') {
      throw new ApiError(400, 'Cannot accept non-pending estimate');
    }

    estimate.status = 'accepted';
    estimate.acceptedAt = Date.now();
    await estimate.save();

    await ServiceRequest.findByIdAndUpdate(estimate.serviceRequestId, {
      estimateStatus: 'accepted',
      totalCost: estimate.totalAmount
    });

    const response = new ResponseHandler(res);
    return response.success(estimate);
  }),

  rejectEstimate: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid estimate ID');
    }

    const estimate = await Estimate.findById(id);
    if (!estimate) {
      throw new ApiError(404, 'Estimate not found');
    }

    if (estimate.status !== 'pending') {
      throw new ApiError(400, 'Cannot reject non-pending estimate');
    }

    estimate.status = 'rejected';
    estimate.rejectionReason = req.body.reason;
    estimate.rejectedAt = Date.now();
    await estimate.save();

    await ServiceRequest.findByIdAndUpdate(estimate.serviceRequestId, {
      estimateStatus: 'rejected',
      currentEstimate: null
    });

    const response = new ResponseHandler(res);
    return response.success(estimate);
  }),

  getEstimatesByRequest: catchAsync(async (req, res) => {
    const { requestId } = req.params;
    if (!validationHelper.isValidId(requestId)) {
      throw new ApiError(400, 'Invalid request ID');
    }

    const estimates = await Estimate.find({ serviceRequestId: requestId })
      .populate('providerId')
      .sort({ createdAt: -1 });

    const response = new ResponseHandler(res);
    return response.success(estimates);
  }),

  getProviderEstimates: catchAsync(async (req, res) => {
    const { providerId } = req.params;
    if (!validationHelper.isValidId(providerId)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { status } = req.query;

    const query = { providerId };
    if (status) query.status = status;

    const estimates = await Estimate.find(query)
      .skip(skip)
      .limit(limit)
      .populate('serviceRequestId')
      .sort({ createdAt: -1 });

    const total = await Estimate.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      estimates,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  })
};

function calculateTotalAmount(estimate) {
  const subtotal = estimate.laborCost + estimate.partsCost +
    estimate.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const taxAmount = (subtotal * estimate.tax) / 100;
  const discountAmount = (subtotal * estimate.discount) / 100;
  return subtotal + taxAmount - discountAmount;
}

module.exports = estimateController; 