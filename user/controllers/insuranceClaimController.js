const InsuranceClaim = require('../models/InsuranceClaim');
const InsuranceDoc = require('../models/InsuranceDoc');
const UserCar = require('../models/UserCar');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const insuranceClaimController = {
  createClaim: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userCarId) || 
        !validationHelper.isValidId(req.body.insuranceDocId)) {
      throw new ApiError(400, 'Invalid user car ID or insurance document ID');
    }

    const insuranceDoc = await InsuranceDoc.findById(req.body.insuranceDocId);
    if (!insuranceDoc || insuranceDoc.status !== 'active') {
      throw new ApiError(400, 'Invalid or inactive insurance policy');
    }

    const claim = new InsuranceClaim({
      userCarId: req.body.userCarId,
      insuranceDocId: req.body.insuranceDocId,
      claimType: req.body.claimType,
      incidentDate: req.body.incidentDate,
      description: req.body.description,
      location: req.body.location,
      estimatedAmount: req.body.estimatedAmount,
      thirdPartyInvolved: req.body.thirdPartyInvolved,
      thirdPartyDetails: req.body.thirdPartyDetails
    });

    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/claim-documents')
      ));
      claim.documents = documents.map(path => ({
        url: path,
        type: 'incident_photo'
      }));
    }

    await claim.save();

    const populatedClaim = await InsuranceClaim.findById(claim._id)
      .populate('userCarId')
      .populate('insuranceDocId');

    const response = new ResponseHandler(res);
    return response.created(populatedClaim);
  }),

  getClaimById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid claim ID');
    }

    const claim = await InsuranceClaim.findById(id)
      .populate('userCarId')
      .populate('insuranceDocId');

    if (!claim) {
      throw new ApiError(404, 'Claim not found');
    }

    const response = new ResponseHandler(res);
    return response.success(claim);
  }),

  updateClaim: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid claim ID');
    }

    const claim = await InsuranceClaim.findById(id);
    if (!claim) {
      throw new ApiError(404, 'Claim not found');
    }

    if (claim.status !== 'pending') {
      throw new ApiError(400, 'Cannot update non-pending claim');
    }

    if (req.files && req.files.length > 0) {
      const newDocuments = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/claim-documents')
      ));
      req.body.documents = [
        ...(claim.documents || []),
        ...newDocuments.map(path => ({
          url: path,
          type: 'additional_document'
        }))
      ];
    }

    const updatedClaim = await InsuranceClaim.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userCarId')
      .populate('insuranceDocId');

    const response = new ResponseHandler(res);
    return response.success(updatedClaim);
  }),

  updateClaimStatus: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid claim ID');
    }

    const claim = await InsuranceClaim.findById(id);
    if (!claim) {
      throw new ApiError(404, 'Claim not found');
    }

    claim.status = req.body.status;
    claim.statusNote = req.body.statusNote;
    claim.approvedAmount = req.body.approvedAmount;
    claim.processedBy = req.user.id;
    claim.processedAt = Date.now();

    if (req.body.status === 'approved') {
      claim.approvalDetails = {
        approvedBy: req.user.id,
        approvedAt: Date.now(),
        paymentMethod: req.body.paymentMethod,
        paymentDetails: req.body.paymentDetails
      };
    }

    await claim.save();

    const populatedClaim = await InsuranceClaim.findById(claim._id)
      .populate('userCarId')
      .populate('insuranceDocId');

    const response = new ResponseHandler(res);
    return response.success(populatedClaim);
  }),

  getVehicleClaims: catchAsync(async (req, res) => {
    const { userCarId } = req.params;
    if (!validationHelper.isValidId(userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { status } = req.query;

    const query = { userCarId };
    if (status) query.status = status;

    const claims = await InsuranceClaim.find(query)
      .skip(skip)
      .limit(limit)
      .populate('insuranceDocId')
      .sort({ createdAt: -1 });

    const total = await InsuranceClaim.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      claims,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  addClaimDocument: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid claim ID');
    }

    if (!req.file) {
      throw new ApiError(400, 'No document provided');
    }

    const claim = await InsuranceClaim.findById(id);
    if (!claim) {
      throw new ApiError(404, 'Claim not found');
    }

    const documentPath = await fileHandler.saveFile(req.file, 'uploads/claim-documents');
    
    claim.documents.push({
      url: documentPath,
      type: req.body.documentType,
      description: req.body.description
    });

    await claim.save();

    const response = new ResponseHandler(res);
    return response.success(claim);
  }),

  removeClaimDocument: catchAsync(async (req, res) => {
    const { id, documentId } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid claim ID');
    }

    const claim = await InsuranceClaim.findById(id);
    if (!claim) {
      throw new ApiError(404, 'Claim not found');
    }

    const document = claim.documents.id(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }

    await fileHandler.deleteFile(document.url);
    document.remove();
    await claim.save();

    const response = new ResponseHandler(res);
    return response.success(claim);
  })
};

module.exports = insuranceClaimController; 