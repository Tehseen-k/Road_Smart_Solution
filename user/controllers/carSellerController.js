const CarSeller = require('../models/CarSeller');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const carSellerController = {
  createSeller: catchAsync(async (req, res) => {
    const existingSeller = await CarSeller.findOne({
      userId: req.body.userId
    });

    if (existingSeller) {
      throw new ApiError(400, 'Seller already exists for this user');
    }

    const seller = new CarSeller({
      userId: req.body.userId,
      businessName: req.body.businessName,
      contactInfo: req.body.contactInfo,
      address: req.body.address
    });

    await seller.save();

    const response = new ResponseHandler(res);
    return response.created(seller);
  }),

  getAllSellers: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { businessName, sortBy } = req.query;

    const query = {};
    if (businessName) query.businessName = new RegExp(businessName, 'i');

    let sort = { createdAt: -1 };
    if (sortBy === 'businessName') sort = { businessName: 1 };

    const sellers = await CarSeller.find(query)
      .populate('userId')
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await CarSeller.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      sellers,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getSellerById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const seller = await CarSeller.findById(id).populate('userId');
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    const response = new ResponseHandler(res);
    return response.success(seller);
  }),

  updateSeller: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const seller = await CarSeller.findById(id);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    const updatedSeller = await CarSeller.findByIdAndUpdate(
      id,
      {
        businessName: req.body.businessName,
        contactInfo: req.body.contactInfo,
        address: req.body.address
      },
      { new: true, runValidators: true }
    ).populate('userId');

    const response = new ResponseHandler(res);
    return response.success(updatedSeller);
  }),

  deleteSeller: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const seller = await CarSeller.findById(id);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    await seller.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  updateSellerRating: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const seller = await CarSeller.findById(id);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    const newRating = parseFloat(req.body.rating);
    if (isNaN(newRating) || newRating < 1 || newRating > 5) {
      throw new ApiError(400, 'Invalid rating value');
    }

    seller.ratings.count += 1;
    seller.ratings.average = (
      (seller.ratings.average * (seller.ratings.count - 1) + newRating) / 
      seller.ratings.count
    ).toFixed(1);

    await seller.save();

    const response = new ResponseHandler(res);
    return response.success(seller);
  }),

  searchSellers: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchQuery = {
      $or: [
        { businessName: new RegExp(query, 'i') },
        { contactInfo: new RegExp(query, 'i') },
        { address: new RegExp(query, 'i') }
      ]
    };

    const sellers = await CarSeller.find(searchQuery)
      .populate('userId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await CarSeller.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      sellers,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  })
};

module.exports = carSellerController; 