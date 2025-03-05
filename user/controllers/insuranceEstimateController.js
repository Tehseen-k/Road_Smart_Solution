const InsuranceEstimate = require('../models/InsuranceEstimate');
const InsuranceDetail = require('../models/InsuranceDetail');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');

const insuranceEstimateController = {
  createEstimate: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const estimate = new InsuranceEstimate({
      userCarId: req.body.userCarId,
      provider: req.body.provider,
      policyType: req.body.policyType,
      coverageType: req.body.coverageType,
      coverageDetails: req.body.coverageDetails,
      premium: {
        monthly: req.body.premium.monthly,
        quarterly: req.body.premium.quarterly,
        semiAnnual: req.body.premium.semiAnnual,
        annual: req.body.premium.annual
      },
      deductible: req.body.deductible,
      coverageAmount: req.body.coverageAmount,
      additionalCoverage: req.body.additionalCoverage || [],
      terms: req.body.terms,
      validUntil: req.body.validUntil,
      status: 'pending'
    });

    await estimate.save();

    const populatedEstimate = await InsuranceEstimate.findById(estimate._id)
      .populate('userCarId');

    const response = new ResponseHandler(res);
    return response.created(populatedEstimate);
  }),

  getEstimateById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid estimate ID');
    }

    const estimate = await InsuranceEstimate.findById(id)
      .populate('userCarId');

    if (!estimate) {
      throw new ApiError(404, 'Insurance estimate not found');
    }

    const response = new ResponseHandler(res);
    return response.success(estimate);
  }),

  getCarEstimates: catchAsync(async (req, res) => {
    const { userCarId } = req.params;
    if (!validationHelper.isValidId(userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { status } = req.query;

    const query = { userCarId };
    if (status) query.status = status;

    const estimates = await InsuranceEstimate.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await InsuranceEstimate.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      estimates,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  updateEstimate: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid estimate ID');
    }

    const estimate = await InsuranceEstimate.findById(id);
    if (!estimate) {
      throw new ApiError(404, 'Insurance estimate not found');
    }

    if (estimate.status !== 'pending') {
      throw new ApiError(400, 'Cannot update non-pending estimate');
    }

    const updatedEstimate = await InsuranceEstimate.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userCarId');

    const response = new ResponseHandler(res);
    return response.success(updatedEstimate);
  }),

  acceptEstimate: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid estimate ID');
    }

    const estimate = await InsuranceEstimate.findById(id);
    if (!estimate) {
      throw new ApiError(404, 'Insurance estimate not found');
    }

    if (estimate.status !== 'pending') {
      throw new ApiError(400, 'Cannot accept non-pending estimate');
    }

    // Create new insurance detail from estimate
    const insuranceDetail = new InsuranceDetail({
      userCarId: estimate.userCarId,
      provider: estimate.provider,
      policyType: estimate.policyType,
      coverageType: estimate.coverageType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      premium: req.body.premiumOption === 'monthly' ? estimate.premium.monthly :
              req.body.premiumOption === 'quarterly' ? estimate.premium.quarterly :
              req.body.premiumOption === 'semiAnnual' ? estimate.premium.semiAnnual :
              estimate.premium.annual,
      premiumPaymentFrequency: req.body.premiumOption,
      deductible: estimate.deductible,
      coverageAmount: estimate.coverageAmount,
      additionalCoverage: estimate.additionalCoverage,
      terms: estimate.terms,
      status: 'active'
    });

    await insuranceDetail.save();
    
    estimate.status = 'accepted';
    estimate.acceptedAt = Date.now();
    estimate.resultingPolicy = insuranceDetail._id;
    await estimate.save();

    const response = new ResponseHandler(res);
    return response.success({
      estimate,
      insuranceDetail
    });
  }),

  rejectEstimate: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid estimate ID');
    }

    const estimate = await InsuranceEstimate.findById(id);
    if (!estimate) {
      throw new ApiError(404, 'Insurance estimate not found');
    }

    if (estimate.status !== 'pending') {
      throw new ApiError(400, 'Cannot reject non-pending estimate');
    }

    estimate.status = 'rejected';
    estimate.rejectionReason = req.body.reason;
    estimate.rejectedAt = Date.now();
    await estimate.save();

    const response = new ResponseHandler(res);
    return response.success(estimate);
  }),

  compareEstimates: catchAsync(async (req, res) => {
    const { estimateIds } = req.body;
    if (!Array.isArray(estimateIds) || estimateIds.length < 2) {
      throw new ApiError(400, 'Please provide at least two estimate IDs to compare');
    }

    const estimates = await InsuranceEstimate.find({
      _id: { $in: estimateIds }
    }).populate('userCarId');

    if (estimates.length !== estimateIds.length) {
      throw new ApiError(404, 'One or more estimates not found');
    }

    const response = new ResponseHandler(res);
    return response.success({
      estimates,
      comparison: {
        premiums: estimates.map(est => ({
          provider: est.provider,
          monthly: est.premium.monthly,
          annual: est.premium.annual
        })),
        coverageAmounts: estimates.map(est => ({
          provider: est.provider,
          amount: est.coverageAmount
        })),
        deductibles: estimates.map(est => ({
          provider: est.provider,
          amount: est.deductible
        }))
      }
    });
  })
};

module.exports = insuranceEstimateController; 