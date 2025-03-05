const RentalBooking = require('../models/RentalBooking');
const RentalCar = require('../models/RentalCar');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const rentalBookingController = {
  // Create new booking
  createBooking: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId) || 
        !validationHelper.isValidId(req.body.carId)) {
      throw new ApiError(400, 'Invalid user ID or car ID');
    }

    // Validate dates
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    
    if (startDate >= endDate) {
      throw new ApiError(400, 'End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new ApiError(400, 'Start date cannot be in the past');
    }

    // Check car availability
    const car = await RentalCar.findById(req.body.carId);
    if (!car) {
      throw new ApiError(404, 'Rental car not found');
    }

    if (!car.availability) {
      throw new ApiError(400, 'Car is not available for rental');
    }

    const existingBooking = await RentalBooking.findOne({
      carId: req.body.carId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });

    if (existingBooking) {
      throw new ApiError(400, 'Car is not available for the selected dates');
    }

    // Calculate total amount
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalAmount = days * car.dailyRate;

    const booking = new RentalBooking({
      ...req.body,
      totalAmount,
      status: 'pending'
    });

    // Handle document uploads
    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        return await fileHandler.saveFile(file, 'uploads/rental-documents');
      }));
      booking.documents = documents;
    }

    await booking.save();

    const populatedBooking = await RentalBooking.findById(booking._id)
      .populate('userId', 'username email phone')
      .populate('carId')
      .populate('providerId');

    const response = new ResponseHandler(res);
    return response.created(populatedBooking, 'Booking created successfully');
  }),

  // Get all bookings
  getAllBookings: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    // Date range filter
    if (query.startDate && query.endDate) {
      query.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
      delete query.startDate;
      delete query.endDate;
    }

    const bookings = await RentalBooking.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone')
      .populate('carId')
      .populate('providerId')
      .sort({ createdAt: -1 });

    const total = await RentalBooking.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      bookings,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get booking by ID
  getBookingById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid booking ID');
    }

    const booking = await RentalBooking.findById(req.params.id)
      .populate('userId', 'username email phone')
      .populate('carId')
      .populate('providerId');

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    const response = new ResponseHandler(res);
    return response.success(booking);
  }),

  // Update booking status
  updateBookingStatus: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid booking ID');
    }

    const { status, remarks } = req.body;
    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    const booking = await RentalBooking.findById(req.params.id);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Additional validation based on status transition
    if (booking.status === 'cancelled') {
      throw new ApiError(400, 'Cannot update cancelled booking');
    }

    if (status === 'active' && booking.status !== 'confirmed') {
      throw new ApiError(400, 'Booking must be confirmed before becoming active');
    }

    const updatedBooking = await RentalBooking.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        remarks,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username email phone')
      .populate('carId')
      .populate('providerId');

    // Update car availability if booking is completed or cancelled
    if (['completed', 'cancelled'].includes(status)) {
      await RentalCar.findByIdAndUpdate(booking.carId, {
        availability: true
      });
    }

    const response = new ResponseHandler(res);
    return response.success(updatedBooking, 'Booking status updated successfully');
  }),

  // Get user's booking history
  getUserBookings: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const bookings = await RentalBooking.find({ userId })
      .skip(skip)
      .limit(limit)
      .populate('carId')
      .populate('providerId')
      .sort({ createdAt: -1 });

    const total = await RentalBooking.countDocuments({ userId });

    const response = new ResponseHandler(res);
    return response.success({
      bookings,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get provider's bookings
  getProviderBookings: catchAsync(async (req, res) => {
    const { providerId } = req.params;
    if (!validationHelper.isValidId(providerId)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const bookings = await RentalBooking.find({ providerId })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone')
      .populate('carId')
      .sort({ createdAt: -1 });

    const total = await RentalBooking.countDocuments({ providerId });

    const response = new ResponseHandler(res);
    return response.success({
      bookings,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get booking statistics
  getBookingStats: catchAsync(async (req, res) => {
    const stats = await RentalBooking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const monthlyStats = await RentalBooking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const popularCars = await RentalBooking.aggregate([
      {
        $group: {
          _id: '$carId',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'rentalcars',
          localField: '_id',
          foreignField: '_id',
          as: 'car'
        }
      },
      {
        $project: {
          car: { $arrayElemAt: ['$car', 0] },
          bookings: 1,
          revenue: 1
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      statusStats: stats,
      monthlyStats,
      popularCars
    });
  })
};

module.exports = rentalBookingController; 