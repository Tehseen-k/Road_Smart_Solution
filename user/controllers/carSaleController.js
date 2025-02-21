const CarSale = require('../models/CarSale');
const CarPurchase = require('../models/CarPurchase');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const carSaleController = {
  // Create new car listing
  createCarListing: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.sellerId)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    // Validate VIN if provided
    if (req.body.vin) {
      const existingCar = await CarSale.findOne({ vin: req.body.vin });
      if (existingCar) {
        throw new ApiError(400, 'Car with this VIN already exists');
      }
    }

    const carSale = new CarSale(req.body);

    // Handle car images
    if (req.files && req.files.length > 0) {
      const images = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type. Only images are allowed');
        }
        return await fileHandler.saveFile(file, 'uploads/car-sales');
      }));
      carSale.images = images;
    }

    await carSale.save();

    const response = new ResponseHandler(res);
    return response.created(carSale, 'Car listing created successfully');
  }),

  // Get all car listings with filters
  getAllListings: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    // Price range filter
    if (query.minPrice || query.maxPrice) {
      query.price = {};
      if (query.minPrice) query.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) query.price.$lte = parseFloat(query.maxPrice);
      delete query.minPrice;
      delete query.maxPrice;
    }

    // Year range filter
    if (query.minYear || query.maxYear) {
      query.year = {};
      if (query.minYear) query.year.$gte = parseInt(query.minYear);
      if (query.maxYear) query.year.$lte = parseInt(query.maxYear);
      delete query.minYear;
      delete query.maxYear;
    }

    // Mileage range filter
    if (query.maxMileage) {
      query.mileage = { $lte: parseInt(query.maxMileage) };
      delete query.maxMileage;
    }

    const cars = await CarSale.find(query)
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'businessName contactInfo')
      .sort({ createdAt: -1 });

    const total = await CarSale.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      cars,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get car listing by ID
  getListingById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid listing ID');
    }

    const car = await CarSale.findById(req.params.id)
      .populate('sellerId', 'businessName contactInfo address');

    if (!car) {
      throw new ApiError(404, 'Car listing not found');
    }

    const response = new ResponseHandler(res);
    return response.success(car);
  }),

  // Update car listing
  updateListing: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid listing ID');
    }

    const car = await CarSale.findById(req.params.id);
    if (!car) {
      throw new ApiError(404, 'Car listing not found');
    }

    // Handle image updates
    if (req.files && req.files.length > 0) {
      // Delete existing images
      if (car.images && car.images.length > 0) {
        await Promise.all(car.images.map(image => 
          fileHandler.deleteFile(image)
        ));
      }

      // Upload new images
      const images = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type. Only images are allowed');
        }
        return await fileHandler.saveFile(file, 'uploads/car-sales');
      }));
      req.body.images = images;
    }

    const updatedCar = await CarSale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('sellerId', 'businessName contactInfo');

    const response = new ResponseHandler(res);
    return response.success(updatedCar, 'Car listing updated successfully');
  }),

  // Delete car listing
  deleteListing: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid listing ID');
    }

    const car = await CarSale.findById(req.params.id);
    if (!car) {
      throw new ApiError(404, 'Car listing not found');
    }

    // Delete associated images
    if (car.images && car.images.length > 0) {
      await Promise.all(car.images.map(image => 
        fileHandler.deleteFile(image)
      ));
    }

    await car.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Search car listings
  searchListings: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchRegex = new RegExp(query, 'i');
    const searchQuery = {
      $or: [
        { make: searchRegex },
        { model: searchRegex },
        { description: searchRegex }
      ]
    };

    const cars = await CarSale.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'businessName contactInfo')
      .sort({ createdAt: -1 });

    const total = await CarSale.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      cars,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get seller's listings
  getSellerListings: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.sellerId)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const cars = await CarSale.find({ sellerId: req.params.sellerId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await CarSale.countDocuments({ sellerId: req.params.sellerId });

    const response = new ResponseHandler(res);
    return response.success({
      cars,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get listing statistics
  getListingStats: catchAsync(async (req, res) => {
    const stats = await CarSale.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const makeStats = await CarSale.aggregate([
      {
        $group: {
          _id: '$make',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      statusStats: stats,
      makeStats
    });
  })
};

module.exports = carSaleController; 