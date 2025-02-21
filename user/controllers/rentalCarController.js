const RentalCar = require('../models/RentalCar');
const RentalBooking = require('../models/RentalBooking');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const rentalCarController = {
  // Create new rental car
  createRentalCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.providerId)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    // Validate VIN
    if (req.body.vin) {
      const existingCar = await RentalCar.findOne({ vin: req.body.vin });
      if (existingCar) {
        throw new ApiError(400, 'Car with this VIN already exists');
      }
    }

    const rentalCar = new RentalCar(req.body);

    // Handle car images
    if (req.files && req.files.length > 0) {
      const images = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type. Only images are allowed');
        }
        return await fileHandler.saveFile(file, 'uploads/rental-cars');
      }));
      rentalCar.images = images;
    }

    await rentalCar.save();

    const response = new ResponseHandler(res);
    return response.created(rentalCar, 'Rental car created successfully');
  }),

  // Get all rental cars with filters
  getAllRentalCars: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    // Date availability filter
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);

      // Find cars that don't have bookings in the requested period
      const bookedCars = await RentalBooking.find({
        $or: [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
          }
        ]
      }).distinct('carId');

      query._id = { $nin: bookedCars };
      delete query.startDate;
      delete query.endDate;
    }

    // Price range filter
    if (query.minPrice || query.maxPrice) {
      query.dailyRate = {};
      if (query.minPrice) query.dailyRate.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) query.dailyRate.$lte = parseFloat(query.maxPrice);
      delete query.minPrice;
      delete query.maxPrice;
    }

    const cars = await RentalCar.find(query)
      .skip(skip)
      .limit(limit)
      .populate('providerId')
      .sort({ dailyRate: 1 });

    const total = await RentalCar.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      cars,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get rental car by ID
  getRentalCarById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid rental car ID');
    }

    const car = await RentalCar.findById(req.params.id)
      .populate('providerId');

    if (!car) {
      throw new ApiError(404, 'Rental car not found');
    }

    // Get upcoming bookings
    const upcomingBookings = await RentalBooking.find({
      carId: car._id,
      startDate: { $gte: new Date() }
    }).select('startDate endDate');

    const response = new ResponseHandler(res);
    return response.success({
      car,
      upcomingBookings
    });
  }),

  // Update rental car
  updateRentalCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid rental car ID');
    }

    const car = await RentalCar.findById(req.params.id);
    if (!car) {
      throw new ApiError(404, 'Rental car not found');
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
        return await fileHandler.saveFile(file, 'uploads/rental-cars');
      }));
      req.body.images = images;
    }

    const updatedCar = await RentalCar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('providerId');

    const response = new ResponseHandler(res);
    return response.success(updatedCar, 'Rental car updated successfully');
  }),

  // Delete rental car
  deleteRentalCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid rental car ID');
    }

    const car = await RentalCar.findById(req.params.id);
    if (!car) {
      throw new ApiError(404, 'Rental car not found');
    }

    // Check for future bookings
    const futureBookings = await RentalBooking.findOne({
      carId: car._id,
      startDate: { $gte: new Date() }
    });

    if (futureBookings) {
      throw new ApiError(400, 'Cannot delete car with future bookings');
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

  // Check car availability
  checkAvailability: catchAsync(async (req, res) => {
    const { carId, startDate, endDate } = req.query;

    if (!validationHelper.isValidId(carId)) {
      throw new ApiError(400, 'Invalid car ID');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new ApiError(400, 'Invalid date range');
    }

    const existingBookings = await RentalBooking.find({
      carId,
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    const response = new ResponseHandler(res);
    return response.success({
      available: existingBookings.length === 0,
      conflictingBookings: existingBookings
    });
  }),

  // Get rental statistics
  getRentalStats: catchAsync(async (req, res) => {
    const { providerId } = req.params;

    if (providerId && !validationHelper.isValidId(providerId)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const matchStage = providerId ? { providerId: mongoose.Types.ObjectId(providerId) } : {};

    const stats = await RentalCar.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$availability',
          count: { $sum: 1 },
          avgDailyRate: { $avg: '$dailyRate' },
          minDailyRate: { $min: '$dailyRate' },
          maxDailyRate: { $max: '$dailyRate' }
        }
      }
    ]);

    const popularCars = await RentalBooking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$carId',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      availabilityStats: stats,
      popularCars
    });
  })
};

module.exports = rentalCarController; 