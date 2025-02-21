const TyreSize = require('../models/TyreSize');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');

const tyreSizeController = {
  createTyreSize: catchAsync(async (req, res) => {
    const existingSize = await TyreSize.findOne({
      width: req.body.width,
      aspectRatio: req.body.aspectRatio,
      rimDiameter: req.body.rimDiameter,
      construction: req.body.construction
    });

    if (existingSize) {
      throw new ApiError(400, 'Tyre size already exists');
    }

    const tyreSize = new TyreSize({
      width: req.body.width,
      aspectRatio: req.body.aspectRatio,
      construction: req.body.construction,
      rimDiameter: req.body.rimDiameter,
      loadIndex: req.body.loadIndex,
      speedRating: req.body.speedRating,
      description: req.body.description,
      compatibleVehicles: req.body.compatibleVehicles || []
    });

    await tyreSize.save();

    const response = new ResponseHandler(res);
    return response.created(tyreSize);
  }),

  getAllTyreSizes: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { width, aspectRatio, rimDiameter, sortBy } = req.query;

    const query = {};
    if (width) query.width = width;
    if (aspectRatio) query.aspectRatio = aspectRatio;
    if (rimDiameter) query.rimDiameter = rimDiameter;

    let sort = { width: 1, aspectRatio: 1, rimDiameter: 1 };
    if (sortBy === 'loadIndex') sort = { loadIndex: 1 };
    if (sortBy === 'speedRating') sort = { speedRating: 1 };

    const tyreSizes = await TyreSize.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await TyreSize.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      tyreSizes,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getTyreSizeById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid tyre size ID');
    }

    const tyreSize = await TyreSize.findById(id);
    if (!tyreSize) {
      throw new ApiError(404, 'Tyre size not found');
    }

    const response = new ResponseHandler(res);
    return response.success(tyreSize);
  }),

  updateTyreSize: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid tyre size ID');
    }

    const tyreSize = await TyreSize.findById(id);
    if (!tyreSize) {
      throw new ApiError(404, 'Tyre size not found');
    }

    const updatedTyreSize = await TyreSize.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    const response = new ResponseHandler(res);
    return response.success(updatedTyreSize);
  }),

  deleteTyreSize: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid tyre size ID');
    }

    const tyreSize = await TyreSize.findById(id);
    if (!tyreSize) {
      throw new ApiError(404, 'Tyre size not found');
    }

    await tyreSize.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  searchTyreSizes: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchQuery = {
      $or: [
        { description: new RegExp(query, 'i') },
        { 'compatibleVehicles.make': new RegExp(query, 'i') },
        { 'compatibleVehicles.model': new RegExp(query, 'i') }
      ]
    };

    const tyreSizes = await TyreSize.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ width: 1, aspectRatio: 1, rimDiameter: 1 });

    const total = await TyreSize.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      tyreSizes,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getCompatibleSizes: catchAsync(async (req, res) => {
    const { make, model, year } = req.query;

    const query = {
      compatibleVehicles: {
        $elemMatch: {
          make: new RegExp(make, 'i'),
          model: new RegExp(model, 'i')
        }
      }
    };

    if (year) {
      query['compatibleVehicles.$elemMatch'].year = parseInt(year);
    }

    const tyreSizes = await TyreSize.find(query)
      .sort({ width: 1, aspectRatio: 1, rimDiameter: 1 });

    const response = new ResponseHandler(res);
    return response.success(tyreSizes);
  }),

  validateTyreSize: catchAsync(async (req, res) => {
    const { width, aspectRatio, rimDiameter } = req.query;

    if (!width || !aspectRatio || !rimDiameter) {
      throw new ApiError(400, 'Missing required parameters');
    }

    const tyreSize = await TyreSize.findOne({
      width: parseInt(width),
      aspectRatio: parseInt(aspectRatio),
      rimDiameter: parseInt(rimDiameter)
    });

    const response = new ResponseHandler(res);
    return response.success({
      isValid: !!tyreSize,
      tyreSize: tyreSize || null
    });
  })
};

module.exports = tyreSizeController; 