const Review = require('../models/Review');
const ServiceProvider = require('../models/ServiceProvider');
const ServiceRequest = require('../models/ServiceRequest');
const RentalBooking = require('../models/RentalBooking');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const reviewController = {
  // Create new review
  createReview: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId) || 
        !validationHelper.isValidId(req.body.targetId)) {
      throw new ApiError(400, 'Invalid user ID or target ID');
    }

    // Validate review type
    const validTypes = ['service_provider', 'rental_service', 'car_part'];
    if (!validTypes.includes(req.body.type)) {
      throw new ApiError(400, 'Invalid review type');
    }

    // Verify if user can review (check if they have completed service/rental)
    await verifyReviewEligibility(
      req.body.userId,
      req.body.targetId,
      req.body.type,
      req.body.referenceId
    );

    // Check for existing review
    const existingReview = await Review.findOne({
      userId: req.body.userId,
      targetId: req.body.targetId,
      type: req.body.type,
      referenceId: req.body.referenceId
    });

    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this service');
    }

    const review = new Review({
      userId: req.body.userId,
      targetId: req.body.targetId,
      type: req.body.type,
      rating: req.body.rating,
      comment: req.body.comment,
      referenceId: req.body.referenceId
    });

    // Handle review images
    if (req.files && req.files.length > 0) {
      const images = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type. Only images are allowed');
        }
        return await fileHandler.saveFile(file, 'uploads/review-images');
      }));
      review.images = images;
    }

    await review.save();

    // Update target's average rating
    await updateTargetRating(req.body.targetId, req.body.type);

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'username profileImage')
      .populate('targetId');

    const response = new ResponseHandler(res);
    return response.created(populatedReview, 'Review submitted successfully');
  }),

  // Get all reviews
  getAllReviews: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    // Rating filter
    if (query.minRating || query.maxRating) {
      query.rating = {};
      if (query.minRating) query.rating.$gte = parseInt(query.minRating);
      if (query.maxRating) query.rating.$lte = parseInt(query.maxRating);
      delete query.minRating;
      delete query.maxRating;
    }

    const reviews = await Review.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profileImage')
      .populate('targetId')
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      reviews,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get reviews by target
  getTargetReviews: catchAsync(async (req, res) => {
    const { targetId, type } = req.params;
    if (!validationHelper.isValidId(targetId)) {
      throw new ApiError(400, 'Invalid target ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const query = { targetId };
    if (type) query.type = type;

    const reviews = await Review.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profileImage')
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    // Get rating statistics
    const stats = await Review.aggregate([
      { $match: { targetId: mongoose.Types.ObjectId(targetId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      reviews,
      stats,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Update review
  updateReview: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid review ID');
    }

    const review = await Review.findById(id);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'Not authorized to update this review');
    }

    // Handle image updates
    if (req.files && req.files.length > 0) {
      // Delete existing images
      if (review.images && review.images.length > 0) {
        await Promise.all(review.images.map(image => 
          fileHandler.deleteFile(image)
        ));
      }

      const images = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type. Only images are allowed');
        }
        return await fileHandler.saveFile(file, 'uploads/review-images');
      }));
      req.body.images = images;
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        rating: req.body.rating,
        comment: req.body.comment,
        images: req.body.images,
        edited: true,
        editedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username profileImage')
      .populate('targetId');

    // Update target's average rating
    await updateTargetRating(review.targetId, review.type);

    const response = new ResponseHandler(res);
    return response.success(updatedReview, 'Review updated successfully');
  }),

  // Delete review
  deleteReview: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid review ID');
    }

    const review = await Review.findById(id);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to delete this review');
    }

    // Delete review images
    if (review.images && review.images.length > 0) {
      await Promise.all(review.images.map(image => 
        fileHandler.deleteFile(image)
      ));
    }

    await review.remove();

    // Update target's average rating
    await updateTargetRating(review.targetId, review.type);

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Get review statistics
  getReviewStats: catchAsync(async (req, res) => {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          ratings: {
            $push: '$rating'
          }
        }
      },
      {
        $project: {
          count: 1,
          avgRating: 1,
          distribution: {
            $reduce: {
              input: '$ratings',
              initialValue: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
              in: {
                $mergeObjects: [
                  '$$value',
                  { ['$$this']: { $add: [{ $getField: { field: { $toString: '$$this' }, input: '$$value' } }, 1] } }
                ]
              }
            }
          }
        }
      }
    ]);

    const response = new ResponseHandler(res);
    return response.success({ stats });
  })
};

// Helper function to verify review eligibility
async function verifyReviewEligibility(userId, targetId, type, referenceId) {
  switch (type) {
    case 'service_provider':
      const request = await ServiceRequest.findById(referenceId);
      if (!request || request.userId.toString() !== userId || 
          request.status !== 'completed') {
        throw new ApiError(400, 'Cannot review: Invalid or incomplete service request');
      }
      break;
    case 'rental_service':
      const booking = await RentalBooking.findById(referenceId);
      if (!booking || booking.userId.toString() !== userId || 
          booking.status !== 'completed') {
        throw new ApiError(400, 'Cannot review: Invalid or incomplete rental booking');
      }
      break;
    // Add more cases as needed
  }
}

// Helper function to update target's average rating
async function updateTargetRating(targetId, type) {
  const stats = await Review.aggregate([
    { $match: { targetId: mongoose.Types.ObjectId(targetId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    switch (type) {
      case 'service_provider':
        await ServiceProvider.findByIdAndUpdate(targetId, {
          rating: stats[0].avgRating,
          totalReviews: stats[0].totalReviews
        });
        break;
      // Add more cases as needed
    }
  }
}

module.exports = reviewController; 