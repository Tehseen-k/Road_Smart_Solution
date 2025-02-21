const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const fileHandler = require('../utils/fileHandler');

const userProfileController = {
  createProfile: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const existingProfile = await UserProfile.findOne({ userId: req.body.userId });
    if (existingProfile) {
      throw new ApiError(400, 'Profile already exists for this user');
    }

    const profile = new UserProfile({
      userId: req.body.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      preferences: req.body.preferences || {}
    });

    if (req.file) {
      if (!fileHandler.isValidFileType(req.file, ['.jpg', '.jpeg', '.png'])) {
        throw new ApiError(400, 'Invalid file type');
      }
      const imagePath = await fileHandler.saveFile(req.file, 'uploads/profile-images');
      profile.profileImage = imagePath;
    }

    await profile.save();

    await User.findByIdAndUpdate(req.body.userId, {
      hasProfile: true,
      profileId: profile._id
    });

    const populatedProfile = await UserProfile.findById(profile._id)
      .populate('userId', 'email username');

    const response = new ResponseHandler(res);
    return response.created(populatedProfile);
  }),

  getProfile: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const profile = await UserProfile.findOne({ userId })
      .populate('userId', 'email username');

    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    const response = new ResponseHandler(res);
    return response.success(profile);
  }),

  updateProfile: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    if (req.file) {
      if (!fileHandler.isValidFileType(req.file, ['.jpg', '.jpeg', '.png'])) {
        throw new ApiError(400, 'Invalid file type');
      }

      if (profile.profileImage) {
        await fileHandler.deleteFile(profile.profileImage);
      }

      const imagePath = await fileHandler.saveFile(req.file, 'uploads/profile-images');
      req.body.profileImage = imagePath;
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'email username');

    const response = new ResponseHandler(res);
    return response.success(updatedProfile);
  }),

  updatePreferences: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    profile.preferences = {
      ...profile.preferences,
      ...req.body.preferences
    };

    await profile.save();

    const response = new ResponseHandler(res);
    return response.success(profile);
  }),

  deleteProfile: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    if (profile.profileImage) {
      await fileHandler.deleteFile(profile.profileImage);
    }

    await profile.remove();

    await User.findByIdAndUpdate(userId, {
      hasProfile: false,
      profileId: null
    });

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  uploadDocument: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    if (!req.file) {
      throw new ApiError(400, 'No document provided');
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    if (!fileHandler.isValidFileType(req.file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
      throw new ApiError(400, 'Invalid file type');
    }

    const documentPath = await fileHandler.saveFile(req.file, 'uploads/user-documents');

    profile.documents.push({
      type: req.body.documentType,
      path: documentPath,
      verified: false
    });

    await profile.save();

    const response = new ResponseHandler(res);
    return response.success(profile);
  }),

  removeDocument: catchAsync(async (req, res) => {
    const { userId, documentId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    const document = profile.documents.id(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }

    await fileHandler.deleteFile(document.path);
    document.remove();
    await profile.save();

    const response = new ResponseHandler(res);
    return response.success(profile);
  }),

  verifyDocument: catchAsync(async (req, res) => {
    const { userId, documentId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    const document = profile.documents.id(documentId);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }

    document.verified = true;
    document.verifiedAt = Date.now();
    document.verifiedBy = req.user.id;

    await profile.save();

    const response = new ResponseHandler(res);
    return response.success(profile);
  })
};

module.exports = userProfileController; 