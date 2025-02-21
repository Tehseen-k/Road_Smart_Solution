const InsuranceDoc = require('../models/InsuranceDoc');
const UserCar = require('../models/UserCar');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const insuranceDocController = {
  createInsuranceDoc: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const existingDoc = await InsuranceDoc.findOne({
      userCarId: req.body.userCarId,
      status: 'active'
    });

    if (existingDoc) {
      throw new ApiError(400, 'Active insurance already exists for this car');
    }

    const userCar = await UserCar.findById(req.body.userCarId);
    if (!userCar) {
      throw new ApiError(404, 'User car not found');
    }

    const insuranceDoc = new InsuranceDoc({
      userCarId: req.body.userCarId,
      policyNumber: req.body.policyNumber,
      provider: req.body.provider,
      type: req.body.type,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      coverage: req.body.coverage,
      premium: req.body.premium,
      deductible: req.body.deductible,
      beneficiaries: req.body.beneficiaries || [],
      additionalCoverage: req.body.additionalCoverage || []
    });

    if (req.file) {
      const documentPath = await fileHandler.saveFile(req.file, 'uploads/insurance-documents');
      insuranceDoc.documentUrl = documentPath;
    }

    await insuranceDoc.save();

    await UserCar.findByIdAndUpdate(req.body.userCarId, {
      $set: { currentInsurance: insuranceDoc._id }
    });

    const populatedDoc = await InsuranceDoc.findById(insuranceDoc._id)
      .populate('userCarId');

    const response = new ResponseHandler(res);
    return response.created(populatedDoc);
  }),

  getInsuranceDocById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance document ID');
    }

    const insuranceDoc = await InsuranceDoc.findById(id)
      .populate('userCarId');

    if (!insuranceDoc) {
      throw new ApiError(404, 'Insurance document not found');
    }

    const response = new ResponseHandler(res);
    return response.success(insuranceDoc);
  }),

  getVehicleInsurance: catchAsync(async (req, res) => {
    const { userCarId } = req.params;
    if (!validationHelper.isValidId(userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const insuranceDocs = await InsuranceDoc.find({ userCarId })
      .skip(skip)
      .limit(limit)
      .sort({ startDate: -1 });

    const total = await InsuranceDoc.countDocuments({ userCarId });

    const response = new ResponseHandler(res);
    return response.success({
      insuranceDocs,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  updateInsuranceDoc: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance document ID');
    }

    const insuranceDoc = await InsuranceDoc.findById(id);
    if (!insuranceDoc) {
      throw new ApiError(404, 'Insurance document not found');
    }

    if (req.file) {
      if (insuranceDoc.documentUrl) {
        await fileHandler.deleteFile(insuranceDoc.documentUrl);
      }
      const documentPath = await fileHandler.saveFile(req.file, 'uploads/insurance-documents');
      req.body.documentUrl = documentPath;
    }

    const updatedDoc = await InsuranceDoc.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userCarId');

    const response = new ResponseHandler(res);
    return response.success(updatedDoc);
  }),

  renewInsurance: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance document ID');
    }

    const oldDoc = await InsuranceDoc.findById(id);
    if (!oldDoc) {
      throw new ApiError(404, 'Insurance document not found');
    }

    oldDoc.status = 'expired';
    await oldDoc.save();

    const newDoc = new InsuranceDoc({
      userCarId: oldDoc.userCarId,
      policyNumber: req.body.policyNumber,
      provider: oldDoc.provider,
      type: oldDoc.type,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      coverage: req.body.coverage || oldDoc.coverage,
      premium: req.body.premium,
      deductible: req.body.deductible,
      beneficiaries: req.body.beneficiaries || oldDoc.beneficiaries,
      additionalCoverage: req.body.additionalCoverage || oldDoc.additionalCoverage,
      renewedFrom: oldDoc._id
    });

    if (req.file) {
      const documentPath = await fileHandler.saveFile(req.file, 'uploads/insurance-documents');
      newDoc.documentUrl = documentPath;
    }

    await newDoc.save();

    await UserCar.findByIdAndUpdate(oldDoc.userCarId, {
      $set: { currentInsurance: newDoc._id }
    });

    const populatedDoc = await InsuranceDoc.findById(newDoc._id)
      .populate('userCarId');

    const response = new ResponseHandler(res);
    return response.success(populatedDoc);
  }),

  cancelInsurance: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance document ID');
    }

    const insuranceDoc = await InsuranceDoc.findById(id);
    if (!insuranceDoc) {
      throw new ApiError(404, 'Insurance document not found');
    }

    insuranceDoc.status = 'cancelled';
    insuranceDoc.cancellationReason = req.body.reason;
    insuranceDoc.cancelledAt = Date.now();
    await insuranceDoc.save();

    await UserCar.findByIdAndUpdate(insuranceDoc.userCarId, {
      $unset: { currentInsurance: 1 }
    });

    const response = new ResponseHandler(res);
    return response.success(insuranceDoc);
  }),

  verifyInsurance: catchAsync(async (req, res) => {
    const { policyNumber } = req.params;

    const insuranceDoc = await InsuranceDoc.findOne({ policyNumber })
      .populate('userCarId');

    if (!insuranceDoc) {
      throw new ApiError(404, 'Insurance policy not found');
    }

    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil(
      (insuranceDoc.endDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    const response = new ResponseHandler(res);
    return response.success({
      insuranceDoc,
      daysUntilExpiry,
      isExpired: currentDate > insuranceDoc.endDate,
      isActive: insuranceDoc.status === 'active'
    });
  })
};

module.exports = insuranceDocController; 