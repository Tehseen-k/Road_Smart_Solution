const Insurance = require('../models/Insurance');
const InsuranceClaim = require('../models/InsuranceClaim');
const InsuranceDoc = require('../models/InsuranceDoc');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const fileHandler = require('../../utils/fileHandler');
const paginationHelper = require('../../utils/paginationHelper');
const validationHelper = require('../../utils/validationHelper');

const insuranceController = {
  // Create new insurance
  createInsurance: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId) || 
        !validationHelper.isValidId(req.body.providerId)) {
      throw new ApiError(400, 'Invalid user or provider ID');
    }

    const insurance = new Insurance(req.body);
    await insurance.save();

    // Handle document uploads
    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        const fileName = await fileHandler.saveFile(file, 'uploads/insurance');
        return {
          insuranceId: insurance._id,
          docName: file.originalname,
          filePath: fileName
        };
      }));

      await InsuranceDoc.insertMany(documents);
    }

    const populatedInsurance = await Insurance.findById(insurance._id)
      .populate('userId')
      .populate('providerId')
      .populate('vehicleId')
      .populate('documents');

    res.status(201).json({
      status: 'success',
      data: populatedInsurance
    });
  }),

  // Get all insurances with filtering
  getAllInsurances: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    
    let query = {};
    
    // Apply filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (req.query.startDate && req.query.endDate) {
      query.startDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const insurances = await Insurance.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId')
      .populate('providerId')
      .populate('vehicleId')
      .populate('documents');

    const total = await Insurance.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: insurances,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get insurance by ID
  getInsuranceById: catchAsync(async (req, res) => {
    const insurance = await Insurance.findById(req.params.id)
      .populate('userId')
      .populate('providerId')
      .populate('vehicleId')
      .populate('documents');

    if (!insurance) {
      throw new ApiError(404, 'Insurance not found');
    }

    res.status(200).json({
      status: 'success',
      data: insurance
    });
  }),

  // Update insurance
  updateInsurance: catchAsync(async (req, res) => {
    const insurance = await Insurance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!insurance) {
      throw new ApiError(404, 'Insurance not found');
    }

    // Handle document updates
    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        const fileName = await fileHandler.saveFile(file, 'uploads/insurance');
        return {
          insuranceId: insurance._id,
          docName: file.originalname,
          filePath: fileName
        };
      }));

      await InsuranceDoc.insertMany(documents);
    }

    const updatedInsurance = await Insurance.findById(insurance._id)
      .populate('userId')
      .populate('providerId')
      .populate('vehicleId')
      .populate('documents');

    res.status(200).json({
      status: 'success',
      data: updatedInsurance
    });
  }),

  // Delete insurance
  deleteInsurance: catchAsync(async (req, res) => {
    const insurance = await Insurance.findById(req.params.id);
    if (!insurance) {
      throw new ApiError(404, 'Insurance not found');
    }

    // Delete associated documents
    const documents = await InsuranceDoc.find({ insuranceId: insurance._id });
    await Promise.all(documents.map(doc => 
      fileHandler.deleteFile(doc.filePath)
    ));
    await InsuranceDoc.deleteMany({ insuranceId: insurance._id });

    await insurance.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  }),

  // File claim
  fileClaim: catchAsync(async (req, res) => {
    const insurance = await Insurance.findById(req.params.insuranceId);
    if (!insurance) {
      throw new ApiError(404, 'Insurance not found');
    }

    const claim = new InsuranceClaim({
      ...req.body,
      insuranceId: insurance._id,
      userId: insurance.userId
    });

    await claim.save();

    // Handle claim documents
    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        const fileName = await fileHandler.saveFile(file, 'uploads/claims');
        return {
          claimId: claim._id,
          docName: file.originalname,
          filePath: fileName
        };
      }));

      await InsuranceClaimDoc.insertMany(documents);
    }

    res.status(201).json({
      status: 'success',
      data: claim
    });
  }),

  // Get claims by insurance
  getClaims: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    
    const claims = await InsuranceClaim.find({ 
      insuranceId: req.params.insuranceId 
    })
      .skip(skip)
      .limit(limit)
      .populate('documents');

    const total = await InsuranceClaim.countDocuments({ 
      insuranceId: req.params.insuranceId 
    });

    res.status(200).json({
      status: 'success',
      data: claims,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Update claim status
  updateClaimStatus: catchAsync(async (req, res) => {
    const { claimId } = req.params;
    const { status, remarks } = req.body;

    const claim = await InsuranceClaim.findByIdAndUpdate(
      claimId,
      { 
        status,
        remarks,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!claim) {
      throw new ApiError(404, 'Claim not found');
    }

    res.status(200).json({
      status: 'success',
      data: claim
    });
  }),

  // Get insurance statistics
  getInsuranceStats: catchAsync(async (req, res) => {
    const stats = await Insurance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premiumAmount' },
          avgSumInsured: { $avg: '$sumInsured' }
        }
      }
    ]);

    const claimStats = await InsuranceClaim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalClaimAmount: { $sum: '$claimAmount' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        insuranceStats: stats,
        claimStats
      }
    });
  }),

  // Renew insurance
  renewInsurance: catchAsync(async (req, res) => {
    const oldInsurance = await Insurance.findById(req.params.id);
    if (!oldInsurance) {
      throw new ApiError(404, 'Insurance not found');
    }

    const newInsurance = new Insurance({
      ...oldInsurance.toObject(),
      _id: undefined,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      premiumAmount: req.body.premiumAmount,
      policyNumber: req.body.policyNumber,
      status: 'active'
    });

    await newInsurance.save();

    // Copy documents if needed
    const oldDocs = await InsuranceDoc.find({ insuranceId: oldInsurance._id });
    const newDocs = oldDocs.map(doc => ({
      ...doc.toObject(),
      _id: undefined,
      insuranceId: newInsurance._id
    }));

    if (newDocs.length > 0) {
      await InsuranceDoc.insertMany(newDocs);
    }

    res.status(201).json({
      status: 'success',
      data: newInsurance
    });
  })
};

module.exports = insuranceController; 