const InsuranceDetail = require('../models/InsuranceDetail');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const insuranceDetailController = {
  createInsuranceDetail: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const existingInsurance = await InsuranceDetail.findOne({
      userCarId: req.body.userCarId,
      status: 'active'
    });

    if (existingInsurance) {
      throw new ApiError(400, 'Active insurance already exists for this car');
    }

    const insuranceDetail = new InsuranceDetail({
      userCarId: req.body.userCarId,
      provider: req.body.provider,
      policyNumber: req.body.policyNumber,
      policyType: req.body.policyType,
      coverageType: req.body.coverageType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      premium: req.body.premium,
      deductible: req.body.deductible,
      coverageAmount: req.body.coverageAmount,
      additionalCoverage: req.body.additionalCoverage || [],
      beneficiaries: req.body.beneficiaries || [],
      terms: req.body.terms,
      status: 'active'
    });

    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/insurance-documents')
      ));
      insuranceDetail.documents = documents.map(path => ({
        url: path,
        type: 'policy_document'
      }));
    }

    await insuranceDetail.save();

    const response = new ResponseHandler(res);
    return response.created(insuranceDetail);
  }),

  getInsuranceById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance ID');
    }

    const insurance = await InsuranceDetail.findById(id)
      .populate('userCarId');

    if (!insurance) {
      throw new ApiError(404, 'Insurance detail not found');
    }

    const response = new ResponseHandler(res);
    return response.success(insurance);
  }),

  getCarInsuranceHistory: catchAsync(async (req, res) => {
    const { userCarId } = req.params;
    if (!validationHelper.isValidId(userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const insuranceHistory = await InsuranceDetail.find({ userCarId })
      .skip(skip)
      .limit(limit)
      .sort({ startDate: -1 });

    const total = await InsuranceDetail.countDocuments({ userCarId });

    const response = new ResponseHandler(res);
    return response.success({
      insuranceHistory,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  updateInsurance: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance ID');
    }

    const insurance = await InsuranceDetail.findById(id);
    if (!insurance) {
      throw new ApiError(404, 'Insurance detail not found');
    }

    if (insurance.status !== 'active') {
      throw new ApiError(400, 'Cannot update non-active insurance');
    }

    if (req.files && req.files.length > 0) {
      const newDocuments = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/insurance-documents')
      ));
      req.body.documents = [
        ...(insurance.documents || []),
        ...newDocuments.map(path => ({
          url: path,
          type: 'additional_document'
        }))
      ];
    }

    const updatedInsurance = await InsuranceDetail.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userCarId');

    const response = new ResponseHandler(res);
    return response.success(updatedInsurance);
  }),

  renewInsurance: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance ID');
    }

    const oldInsurance = await InsuranceDetail.findById(id);
    if (!oldInsurance) {
      throw new ApiError(404, 'Insurance detail not found');
    }

    oldInsurance.status = 'expired';
    await oldInsurance.save();

    const newInsurance = new InsuranceDetail({
      userCarId: oldInsurance.userCarId,
      provider: req.body.provider || oldInsurance.provider,
      policyNumber: req.body.policyNumber,
      policyType: oldInsurance.policyType,
      coverageType: req.body.coverageType || oldInsurance.coverageType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      premium: req.body.premium,
      deductible: req.body.deductible,
      coverageAmount: req.body.coverageAmount,
      additionalCoverage: req.body.additionalCoverage || oldInsurance.additionalCoverage,
      beneficiaries: req.body.beneficiaries || oldInsurance.beneficiaries,
      terms: req.body.terms || oldInsurance.terms,
      renewedFrom: oldInsurance._id,
      status: 'active'
    });

    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/insurance-documents')
      ));
      newInsurance.documents = documents.map(path => ({
        url: path,
        type: 'policy_document'
      }));
    }

    await newInsurance.save();

    const response = new ResponseHandler(res);
    return response.success(newInsurance);
  }),

  cancelInsurance: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance ID');
    }

    const insurance = await InsuranceDetail.findById(id);
    if (!insurance) {
      throw new ApiError(404, 'Insurance detail not found');
    }

    if (insurance.status !== 'active') {
      throw new ApiError(400, 'Cannot cancel non-active insurance');
    }

    insurance.status = 'cancelled';
    insurance.cancellationReason = req.body.reason;
    insurance.cancellationDate = Date.now();
    await insurance.save();

    const response = new ResponseHandler(res);
    return response.success(insurance);
  }),

  addDocument: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid insurance ID');
    }

    if (!req.file) {
      throw new ApiError(400, 'No document provided');
    }

    const insurance = await InsuranceDetail.findById(id);
    if (!insurance) {
      throw new ApiError(404, 'Insurance detail not found');
    }

    const documentPath = await fileHandler.saveFile(req.file, 'uploads/insurance-documents');
    
    insurance.documents.push({
      url: documentPath,
      type: req.body.documentType,
      description: req.body.description
    });

    await insurance.save();

    const response = new ResponseHandler(res);
    return response.success(insurance);
  })
};

module.exports = insuranceDetailController; 