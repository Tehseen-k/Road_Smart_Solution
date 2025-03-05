const ServiceRequest = require('../models/ServiceRequest');
const ServiceProvider = require('../models/ServiceProvider');
const ServiceQuote = require('../models/ServiceQuote');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const serviceRequestController = {
  // Create new service request
  createServiceRequest: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId) || 
        !validationHelper.isValidId(req.body.vehicleId) ||
        !validationHelper.isValidId(req.body.serviceTypeId)) {
      throw new ApiError(400, 'Invalid ID provided');
    }

    const serviceRequest = new ServiceRequest({
      ...req.body,
      status: 'pending'
    });

    // Handle issue images/documents
    if (req.files && req.files.length > 0) {
      const images = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.jpg', '.jpeg', '.png', '.pdf'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        return await fileHandler.saveFile(file, 'uploads/service-requests');
      }));
      serviceRequest.issueImages = images;
    }

    await serviceRequest.save();

    // Find nearby service providers
    const nearbyProviders = await ServiceProvider.find({
      serviceTypes: serviceRequest.serviceTypeId,
      status: 'active'
    }).limit(5);

    // Notify providers about new request
    // This would typically be handled by a notification service
    // await notificationService.notifyProviders(nearbyProviders, serviceRequest);

    const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
      .populate('userId', 'username email phone')
      .populate('vehicleId')
      .populate('serviceTypeId');

    const response = new ResponseHandler(res);
    return response.created({
      request: populatedRequest,
      nearbyProviders
    }, 'Service request created successfully');
  }),

  // Get all service requests
  getAllRequests: catchAsync(async (req, res) => {
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

    const requests = await ServiceRequest.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone')
      .populate('vehicleId')
      .populate('serviceTypeId')
      .sort({ createdAt: -1 });

    const total = await ServiceRequest.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      requests,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get request by ID
  getRequestById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid request ID');
    }

    const request = await ServiceRequest.findById(req.params.id)
      .populate('userId', 'username email phone')
      .populate('vehicleId')
      .populate('serviceTypeId')
      .populate({
        path: 'quotes',
        populate: {
          path: 'providerId',
          select: 'providerName contactInfo ratings'
        }
      });

    if (!request) {
      throw new ApiError(404, 'Service request not found');
    }

    const response = new ResponseHandler(res);
    return response.success(request);
  }),

  // Update request status
  updateRequestStatus: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid request ID');
    }

    const { status, remarks } = req.body;
    const validStatuses = ['pending', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        remarks,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username email phone')
     .populate('vehicleId')
     .populate('serviceTypeId');

    if (!request) {
      throw new ApiError(404, 'Service request not found');
    }

    const response = new ResponseHandler(res);
    return response.success(request, 'Request status updated successfully');
  }),

  // Submit quote for service request
  submitQuote: catchAsync(async (req, res) => {
    const { requestId } = req.params;
    if (!validationHelper.isValidId(requestId) || 
        !validationHelper.isValidId(req.body.providerId)) {
      throw new ApiError(400, 'Invalid ID provided');
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Service request not found');
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Cannot submit quote for non-pending request');
    }

    const existingQuote = await ServiceQuote.findOne({
      requestId,
      providerId: req.body.providerId
    });

    if (existingQuote) {
      throw new ApiError(400, 'Quote already submitted by this provider');
    }

    const quote = new ServiceQuote({
      requestId,
      providerId: req.body.providerId,
      amount: req.body.amount,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime
    });

    await quote.save();
    request.status = 'quoted';
    await request.save();

    const populatedQuote = await ServiceQuote.findById(quote._id)
      .populate('providerId', 'providerName contactInfo ratings');

    const response = new ResponseHandler(res);
    return response.created(populatedQuote, 'Quote submitted successfully');
  }),

  // Get user's service history
  getUserServiceHistory: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const requests = await ServiceRequest.find({ userId })
      .skip(skip)
      .limit(limit)
      .populate('vehicleId')
      .populate('serviceTypeId')
      .populate({
        path: 'quotes',
        populate: {
          path: 'providerId',
          select: 'providerName ratings'
        }
      })
      .sort({ createdAt: -1 });

    const total = await ServiceRequest.countDocuments({ userId });

    const response = new ResponseHandler(res);
    return response.success({
      requests,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get service request statistics
  getRequestStats: catchAsync(async (req, res) => {
    const stats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgQuoteAmount: {
            $avg: {
              $arrayElemAt: ['$quotes.amount', 0]
            }
          }
        }
      }
    ]);

    const serviceTypeStats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$serviceTypeId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'servicetypes',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceType'
        }
      },
      {
        $project: {
          serviceType: { $arrayElemAt: ['$serviceType.name', 0] },
          count: 1
        }
      }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      statusStats: stats,
      serviceTypeStats
    });
  })
};

module.exports = serviceRequestController; 