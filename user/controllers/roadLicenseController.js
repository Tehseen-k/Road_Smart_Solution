const RoadLicense = require('../models/RoadLicense');
const UserCar = require('../models/UserCar');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const roadLicenseController = {
  createLicense: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const existingLicense = await RoadLicense.findOne({
      userCarId: req.body.userCarId,
      status: 'active'
    });

    if (existingLicense) {
      throw new ApiError(400, 'Active license already exists for this car');
    }

    const userCar = await UserCar.findById(req.body.userCarId);
    if (!userCar) {
      throw new ApiError(404, 'User car not found');
    }

    const license = new RoadLicense({
      userCarId: req.body.userCarId,
      licenseNumber: req.body.licenseNumber,
      issuedDate: req.body.issuedDate,
      expiryDate: req.body.expiryDate,
      issuingAuthority: req.body.issuingAuthority,
      type: req.body.type,
      restrictions: req.body.restrictions || [],
      fees: req.body.fees
    });

    if (req.file) {
      const documentPath = await fileHandler.saveFile(req.file, 'uploads/license-documents');
      license.documentUrl = documentPath;
    }

    await license.save();

    await UserCar.findByIdAndUpdate(req.body.userCarId, {
      $set: { currentLicense: license._id }
    });

    const populatedLicense = await RoadLicense.findById(license._id)
      .populate('userCarId');

    const response = new ResponseHandler(res);
    return response.created(populatedLicense);
  }),

  getLicenseById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid license ID');
    }

    const license = await RoadLicense.findById(id)
      .populate('userCarId');

    if (!license) {
      throw new ApiError(404, 'License not found');
    }

    const response = new ResponseHandler(res);
    return response.success(license);
  }),

  getVehicleLicenses: catchAsync(async (req, res) => {
    const { vehicleId } = req.params;
    if (!validationHelper.isValidId(vehicleId)) {
      throw new ApiError(400, 'Invalid vehicle ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const licenses = await RoadLicense.find({ vehicleId })
      .skip(skip)
      .limit(limit)
      .sort({ issuedDate: -1 });

    const total = await RoadLicense.countDocuments({ vehicleId });

    const response = new ResponseHandler(res);
    return response.success({
      licenses,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  updateLicense: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid license ID');
    }

    const license = await RoadLicense.findById(id);
    if (!license) {
      throw new ApiError(404, 'License not found');
    }

    if (req.file) {
      if (license.documentUrl) {
        await fileHandler.deleteFile(license.documentUrl);
      }
      const documentPath = await fileHandler.saveFile(req.file, 'uploads/license-documents');
      req.body.documentUrl = documentPath;
    }

    const updatedLicense = await RoadLicense.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userCarId');

    const response = new ResponseHandler(res);
    return response.success(updatedLicense);
  }),

  renewLicense: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid license ID');
    }

    const oldLicense = await RoadLicense.findById(id);
    if (!oldLicense) {
      throw new ApiError(404, 'License not found');
    }

    oldLicense.status = 'expired';
    await oldLicense.save();

    const newLicense = new RoadLicense({
      userCarId: oldLicense.userCarId,
      licenseNumber: req.body.licenseNumber,
      issuedDate: req.body.issuedDate,
      expiryDate: req.body.expiryDate,
      issuingAuthority: req.body.issuingAuthority,
      type: oldLicense.type,
      restrictions: req.body.restrictions || oldLicense.restrictions,
      fees: req.body.fees,
      renewedFrom: oldLicense._id
    });

    if (req.file) {
      const documentPath = await fileHandler.saveFile(req.file, 'uploads/license-documents');
      newLicense.documentUrl = documentPath;
    }

    await newLicense.save();

    await UserCar.findByIdAndUpdate(oldLicense.userCarId, {
      $set: { currentLicense: newLicense._id }
    });

    const populatedLicense = await RoadLicense.findById(newLicense._id)
      .populate('userCarId');

    const response = new ResponseHandler(res);
    return response.success(populatedLicense);
  }),

  cancelLicense: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid license ID');
    }

    const license = await RoadLicense.findById(id);
    if (!license) {
      throw new ApiError(404, 'License not found');
    }

    license.status = 'cancelled';
    license.cancellationReason = req.body.reason;
    license.cancelledAt = Date.now();
    await license.save();

    await UserCar.findByIdAndUpdate(license.userCarId, {
      $unset: { currentLicense: 1 }
    });

    const response = new ResponseHandler(res);
    return response.success(license);
  }),

  checkLicenseStatus: catchAsync(async (req, res) => {
    const { licenseNumber } = req.params;

    const license = await RoadLicense.findOne({ licenseNumber })
      .populate('userCarId');

    if (!license) {
      throw new ApiError(404, 'License not found');
    }

    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil(
      (license.expiryDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    const response = new ResponseHandler(res);
    return response.success({
      license,
      daysUntilExpiry,
      isExpired: currentDate > license.expiryDate
    });
  })
};

module.exports = roadLicenseController; 