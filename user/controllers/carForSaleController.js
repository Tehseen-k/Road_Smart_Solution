const CarForSale = require('../models/CarForSale');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const carForSaleController = {
  createCarListing: catchAsync(async (req, res) => {
    const existingCar = await CarForSale.findOne({ vin: req.body.vin });
    if (existingCar) {
      throw new ApiError(400, 'Car with this VIN already exists');
    }

    const carListing = new CarForSale({
      sale_id: req.body.sale_id,
      seller_id: req.body.seller_id,
      make: req.body.make,
      model: req.body.model,
      year: req.body.year,
      vin: req.body.vin,
      price: req.body.price,
      mileage: req.body.mileage,
      description: req.body.description,
      status: 'available'
    });

    await carListing.save();

    const response = new ResponseHandler(res);
    return response.created(carListing);
  }),

  getAllListings: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { make, model, year, status } = req.query;

    const query = {};
    if (make) query.make = new RegExp(make, 'i');
    if (model) query.model = new RegExp(model, 'i');
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const listings = await CarForSale.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ sale_id: -1 });

    const total = await CarForSale.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      listings,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getListingById: catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const listing = await CarForSale.findOne({ sale_id: id });
    if (!listing) {
      throw new ApiError(404, 'Car listing not found');
    }

    const response = new ResponseHandler(res);
    return response.success(listing);
  }),

  updateListing: catchAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await CarForSale.findOne({ sale_id: id });
    if (!listing) {
      throw new ApiError(404, 'Car listing not found');
    }

    if (req.body.vin && req.body.vin !== listing.vin) {
      const existingVin = await CarForSale.findOne({ vin: req.body.vin });
      if (existingVin) {
        throw new ApiError(400, 'Car with this VIN already exists');
      }
    }

    const updatedListing = await CarForSale.findOneAndUpdate(
      { sale_id: id },
      req.body,
      { new: true, runValidators: true }
    );

    const response = new ResponseHandler(res);
    return response.success(updatedListing);
  }),

  deleteListing: catchAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await CarForSale.findOne({ sale_id: id });
    if (!listing) {
      throw new ApiError(404, 'Car listing not found');
    }

    await CarForSale.findOneAndDelete({ sale_id: id });

    const response = new ResponseHandler(res);
    return response.success({ message: 'Listing deleted successfully' });
  }),

  getSellerListings: catchAsync(async (req, res) => {
    const { sellerId } = req.params;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { status } = req.query;

    const query = { seller_id: sellerId };
    if (status) query.status = status;

    const listings = await CarForSale.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ sale_id: -1 });

    const total = await CarForSale.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      listings,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  markAsSold: catchAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await CarForSale.findOne({ sale_id: id });
    if (!listing) {
      throw new ApiError(404, 'Car listing not found');
    }

    listing.status = 'sold';
    await listing.save();

    const response = new ResponseHandler(res);
    return response.success(listing);
  }),

  addListingImage: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid listing ID');
    }

    if (!req.file) {
      throw new ApiError(400, 'No image provided');
    }

    const listing = await CarForSale.findById(id);
    if (!listing) {
      throw new ApiError(404, 'Car listing not found');
    }

    const imagePath = await fileHandler.saveFile(req.file, 'uploads/car-sale-images');
    listing.images.push(imagePath);
    await listing.save();

    const response = new ResponseHandler(res);
    return response.success(listing);
  })
};

module.exports = carForSaleController; 