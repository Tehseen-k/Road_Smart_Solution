const ServiceQuote = require('../models/ServiceQuote');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceProvider = require('../models/ServiceProvider');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const serviceQuoteController = {
  // Create new quote
  createQuote: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.requestId) || 
        !validationHelper.isValidId(req.body.providerId)) {
      throw new ApiError(400, 'Invalid request ID or provider ID');
    }

    // Validate request exists and is open
    const request = await ServiceRequest.findById(req.body.requestId);
    if (!request) {
      throw new ApiError(404, 'Service request not found');
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Cannot quote on non-pending request');
    }

    // Check if provider already quoted
    const existingQuote = await ServiceQuote.findOne({
      requestId: req.body.requestId,
      providerId: req.body.providerId
    });

    if (existingQuote) {
      throw new ApiError(400, 'Provider has already submitted a quote');
    }

    const quote = new ServiceQuote({
      requestId: req.body.requestId,
      providerId: req.body.providerId,
      amount: req.body.amount,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materials: req.body.materials || [],
      laborCost: req.body.laborCost,
      status: 'pending'
    });

    // Handle quote attachments
    if (req.files && req.files.length > 0) {
      const attachments = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        return await fileHandler.saveFile(file, 'uploads/quote-documents');
      }));
      quote.attachments = attachments;
    }

    await quote.save();

    // Update request status
    await ServiceRequest.findByIdAndUpdate(req.body.requestId, {
      status: 'quoted',
      $push: { quotes: quote._id }
    });

    const populatedQuote = await ServiceQuote.findById(quote._id)
      .populate('requestId')
      .populate('providerId');

    const response = new ResponseHandler(res);
    return response.created(populatedQuote, 'Quote submitted successfully');
  }),

  // Get all quotes
  getAllQuotes: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    // Amount range filter
    if (query.minAmount || query.maxAmount) {
      query.amount = {};
      if (query.minAmount) query.amount.$gte = parseFloat(query.minAmount);
      if (query.maxAmount) query.amount.$lte = parseFloat(query.maxAmount);
      delete query.minAmount;
      delete query.maxAmount;
    }

    const quotes = await ServiceQuote.find(query)
      .skip(skip)
      .limit(limit)
      .populate('requestId')
      .populate('providerId')
      .sort({ createdAt: -1 });

    const total = await ServiceQuote.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      quotes,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get quote by ID
  getQuoteById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid quote ID');
    }

    const quote = await ServiceQuote.findById(req.params.id)
      .populate('requestId')
      .populate('providerId');

    if (!quote) {
      throw new ApiError(404, 'Quote not found');
    }

    const response = new ResponseHandler(res);
    return response.success(quote);
  }),

  // Update quote
  updateQuote: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid quote ID');
    }

    const quote = await ServiceQuote.findById(req.params.id);
    if (!quote) {
      throw new ApiError(404, 'Quote not found');
    }

    if (quote.status !== 'pending') {
      throw new ApiError(400, 'Cannot update non-pending quote');
    }

    // Handle attachment updates
    if (req.files && req.files.length > 0) {
      // Delete existing attachments
      if (quote.attachments && quote.attachments.length > 0) {
        await Promise.all(quote.attachments.map(attachment => 
          fileHandler.deleteFile(attachment)
        ));
      }

      const attachments = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        return await fileHandler.saveFile(file, 'uploads/quote-documents');
      }));
      req.body.attachments = attachments;
    }

    const updatedQuote = await ServiceQuote.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('requestId')
      .populate('providerId');

    const response = new ResponseHandler(res);
    return response.success(updatedQuote, 'Quote updated successfully');
  }),

  // Update quote status
  updateQuoteStatus: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid quote ID');
    }

    const { status, remarks } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'expired'];
    
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    const quote = await ServiceQuote.findById(req.params.id);
    if (!quote) {
      throw new ApiError(404, 'Quote not found');
    }

    if (quote.status !== 'pending') {
      throw new ApiError(400, 'Cannot update status of non-pending quote');
    }

    const updatedQuote = await ServiceQuote.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        remarks,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('requestId')
      .populate('providerId');

    // If quote is accepted, update request status and reject other quotes
    if (status === 'accepted') {
      await ServiceRequest.findByIdAndUpdate(quote.requestId, {
        status: 'confirmed',
        acceptedQuote: quote._id
      });

      await ServiceQuote.updateMany(
        {
          requestId: quote.requestId,
          _id: { $ne: quote._id }
        },
        {
          status: 'rejected',
          remarks: 'Another quote was accepted'
        }
      );
    }

    const response = new ResponseHandler(res);
    return response.success(updatedQuote, 'Quote status updated successfully');
  }),

  // Get quotes by request
  getQuotesByRequest: catchAsync(async (req, res) => {
    const { requestId } = req.params;
    if (!validationHelper.isValidId(requestId)) {
      throw new ApiError(400, 'Invalid request ID');
    }

    const quotes = await ServiceQuote.find({ requestId })
      .populate('providerId')
      .sort({ amount: 1 });

    const response = new ResponseHandler(res);
    return response.success(quotes);
  }),

  // Get provider's quotes
  getProviderQuotes: catchAsync(async (req, res) => {
    const { providerId } = req.params;
    if (!validationHelper.isValidId(providerId)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const quotes = await ServiceQuote.find({ providerId })
      .skip(skip)
      .limit(limit)
      .populate('requestId')
      .sort({ createdAt: -1 });

    const total = await ServiceQuote.countDocuments({ providerId });

    const response = new ResponseHandler(res);
    return response.success({
      quotes,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get quote statistics
  getQuoteStats: catchAsync(async (req, res) => {
    const stats = await ServiceQuote.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const providerStats = await ServiceQuote.aggregate([
      {
        $group: {
          _id: '$providerId',
          totalQuotes: { $sum: 1 },
          acceptedQuotes: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'serviceproviders',
          localField: '_id',
          foreignField: '_id',
          as: 'provider'
        }
      },
      {
        $project: {
          provider: { $arrayElemAt: ['$provider', 0] },
          totalQuotes: 1,
          acceptedQuotes: 1,
          avgAmount: 1,
          acceptanceRate: {
            $multiply: [
              { $divide: ['$acceptedQuotes', '$totalQuotes'] },
              100
            ]
          }
        }
      },
      { $sort: { acceptanceRate: -1 } }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      statusStats: stats,
      providerStats
    });
  })
};

module.exports = serviceQuoteController; 