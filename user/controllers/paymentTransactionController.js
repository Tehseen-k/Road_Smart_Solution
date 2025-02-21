const PaymentTransaction = require('../models/PaymentTransaction');
const ServiceRequest = require('../models/ServiceRequest');
const RentalBooking = require('../models/RentalBooking');
const CarPartOrder = require('../models/CarPartOrder');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const paymentTransactionController = {
  // Create new payment transaction
  createTransaction: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    // Validate reference type and ID
    const validReferenceTypes = ['service_request', 'rental_booking', 'part_order'];
    if (!validReferenceTypes.includes(req.body.referenceType)) {
      throw new ApiError(400, 'Invalid reference type');
    }

    if (!validationHelper.isValidId(req.body.referenceId)) {
      throw new ApiError(400, 'Invalid reference ID');
    }

    // Verify reference exists and amount matches
    let referenceDoc;
    switch (req.body.referenceType) {
      case 'service_request':
        referenceDoc = await ServiceRequest.findById(req.body.referenceId);
        break;
      case 'rental_booking':
        referenceDoc = await RentalBooking.findById(req.body.referenceId);
        break;
      case 'part_order':
        referenceDoc = await CarPartOrder.findById(req.body.referenceId);
        break;
    }

    if (!referenceDoc) {
      throw new ApiError(404, 'Reference document not found');
    }

    if (referenceDoc.totalAmount !== req.body.amount) {
      throw new ApiError(400, 'Payment amount does not match reference amount');
    }

    const transaction = new PaymentTransaction({
      userId: req.body.userId,
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod,
      referenceType: req.body.referenceType,
      referenceId: req.body.referenceId,
      status: 'pending',
      currency: req.body.currency || 'USD'
    });

    // Handle payment receipt/proof
    if (req.file) {
      if (!fileHandler.isValidFileType(req.file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
        throw new ApiError(400, 'Invalid file type');
      }
      const receiptPath = await fileHandler.saveFile(req.file, 'uploads/payment-receipts');
      transaction.receiptUrl = receiptPath;
    }

    await transaction.save();

    // Update reference document status
    await updateReferenceStatus(req.body.referenceType, req.body.referenceId, 'payment_pending');

    const populatedTransaction = await PaymentTransaction.findById(transaction._id)
      .populate('userId', 'username email');

    const response = new ResponseHandler(res);
    return response.created(populatedTransaction, 'Payment transaction created successfully');
  }),

  // Get all transactions
  getAllTransactions: catchAsync(async (req, res) => {
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

    // Amount range filter
    if (query.minAmount || query.maxAmount) {
      query.amount = {};
      if (query.minAmount) query.amount.$gte = parseFloat(query.minAmount);
      if (query.maxAmount) query.amount.$lte = parseFloat(query.maxAmount);
      delete query.minAmount;
      delete query.maxAmount;
    }

    const transactions = await PaymentTransaction.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    const total = await PaymentTransaction.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      transactions,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get transaction by ID
  getTransactionById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid transaction ID');
    }

    const transaction = await PaymentTransaction.findById(req.params.id)
      .populate('userId', 'username email');

    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
    }

    // Get reference details
    const referenceDetails = await getReferenceDetails(
      transaction.referenceType,
      transaction.referenceId
    );

    const response = new ResponseHandler(res);
    return response.success({
      transaction,
      referenceDetails
    });
  }),

  // Update transaction status
  updateTransactionStatus: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid transaction ID');
    }

    const { status, remarks } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    const transaction = await PaymentTransaction.findById(req.params.id);
    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
    }

    if (transaction.status === 'completed' && status !== 'refunded') {
      throw new ApiError(400, 'Cannot update completed transaction');
    }

    const updatedTransaction = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        remarks,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username email');

    // Update reference status based on payment status
    await updateReferenceStatus(
      transaction.referenceType,
      transaction.referenceId,
      status === 'completed' ? 'payment_completed' : 'payment_failed'
    );

    const response = new ResponseHandler(res);
    return response.success(updatedTransaction, 'Transaction status updated successfully');
  }),

  // Get user's transactions
  getUserTransactions: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const transactions = await PaymentTransaction.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await PaymentTransaction.countDocuments({ userId });

    const response = new ResponseHandler(res);
    return response.success({
      transactions,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get transaction statistics
  getTransactionStats: catchAsync(async (req, res) => {
    const stats = await PaymentTransaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const methodStats = await PaymentTransaction.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successRate: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const dailyStats = await PaymentTransaction.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.date': -1 } },
      { $limit: 30 }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      statusStats: stats,
      paymentMethodStats: methodStats,
      dailyStats
    });
  })
};

// Helper function to update reference status
async function updateReferenceStatus(referenceType, referenceId, status) {
  switch (referenceType) {
    case 'service_request':
      await ServiceRequest.findByIdAndUpdate(referenceId, { paymentStatus: status });
      break;
    case 'rental_booking':
      await RentalBooking.findByIdAndUpdate(referenceId, { paymentStatus: status });
      break;
    case 'part_order':
      await CarPartOrder.findByIdAndUpdate(referenceId, { paymentStatus: status });
      break;
  }
}

// Helper function to get reference details
async function getReferenceDetails(referenceType, referenceId) {
  switch (referenceType) {
    case 'service_request':
      return await ServiceRequest.findById(referenceId)
        .populate('userId', 'username email')
        .populate('serviceTypeId');
    case 'rental_booking':
      return await RentalBooking.findById(referenceId)
        .populate('userId', 'username email')
        .populate('carId');
    case 'part_order':
      return await CarPartOrder.findById(referenceId)
        .populate('userId', 'username email')
        .populate('items.partId');
    default:
      return null;
  }
}

module.exports = paymentTransactionController; 