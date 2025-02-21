const CarPartOrder = require('../models/CarPartOrder');
const CarPart = require('../models/CarPart');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const carPartOrderController = {
  // Create new order
  createOrder: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    // Validate order items
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    // Validate and process each item
    const orderItems = await Promise.all(req.body.items.map(async item => {
      if (!validationHelper.isValidId(item.partId)) {
        throw new ApiError(400, 'Invalid part ID in order items');
      }

      const part = await CarPart.findById(item.partId);
      if (!part) {
        throw new ApiError(404, `Part not found: ${item.partId}`);
      }

      if (part.stockQuantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for part: ${part.name}`);
      }

      return {
        partId: item.partId,
        quantity: item.quantity,
        unitPrice: part.price,
        subtotal: part.price * item.quantity
      };
    }));

    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = new CarPartOrder({
      userId: req.body.userId,
      items: orderItems,
      totalAmount,
      shippingAddress: req.body.shippingAddress,
      status: 'pending'
    });

    // Handle shipping documents
    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        return await fileHandler.saveFile(file, 'uploads/order-documents');
      }));
      order.documents = documents;
    }

    await order.save();

    // Update stock quantities
    await Promise.all(orderItems.map(item =>
      CarPart.findByIdAndUpdate(item.partId, {
        $inc: { stockQuantity: -item.quantity }
      })
    ));

    const populatedOrder = await CarPartOrder.findById(order._id)
      .populate('userId', 'username email phone')
      .populate('items.partId');

    const response = new ResponseHandler(res);
    return response.created(populatedOrder, 'Order created successfully');
  }),

  // Get all orders
  getAllOrders: catchAsync(async (req, res) => {
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
      query.totalAmount = {};
      if (query.minAmount) query.totalAmount.$gte = parseFloat(query.minAmount);
      if (query.maxAmount) query.totalAmount.$lte = parseFloat(query.maxAmount);
      delete query.minAmount;
      delete query.maxAmount;
    }

    const orders = await CarPartOrder.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email phone')
      .populate('items.partId')
      .sort({ createdAt: -1 });

    const total = await CarPartOrder.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      orders,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get order by ID
  getOrderById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid order ID');
    }

    const order = await CarPartOrder.findById(req.params.id)
      .populate('userId', 'username email phone')
      .populate('items.partId');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const response = new ResponseHandler(res);
    return response.success(order);
  }),

  // Update order status
  updateOrderStatus: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid order ID');
    }

    const { status, trackingNumber, remarks } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    const order = await CarPartOrder.findById(req.params.id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Handle status-specific logic
    if (status === 'cancelled' && order.status === 'shipped') {
      throw new ApiError(400, 'Cannot cancel shipped order');
    }

    if (status === 'shipped' && !trackingNumber) {
      throw new ApiError(400, 'Tracking number required for shipped status');
    }

    // Restore stock if order is cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await Promise.all(order.items.map(item =>
        CarPart.findByIdAndUpdate(item.partId, {
          $inc: { stockQuantity: item.quantity }
        })
      ));
    }

    const updatedOrder = await CarPartOrder.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        trackingNumber,
        remarks,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username email phone')
      .populate('items.partId');

    const response = new ResponseHandler(res);
    return response.success(updatedOrder, 'Order status updated successfully');
  }),

  // Get user's order history
  getUserOrders: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const orders = await CarPartOrder.find({ userId })
      .skip(skip)
      .limit(limit)
      .populate('items.partId')
      .sort({ createdAt: -1 });

    const total = await CarPartOrder.countDocuments({ userId });

    const response = new ResponseHandler(res);
    return response.success({
      orders,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get order statistics
  getOrderStats: catchAsync(async (req, res) => {
    const stats = await CarPartOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const monthlyStats = await CarPartOrder.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const topSellingParts = await CarPartOrder.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.partId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } }
        }
      },
      {
        $lookup: {
          from: 'carparts',
          localField: '_id',
          foreignField: '_id',
          as: 'part'
        }
      },
      {
        $project: {
          part: { $arrayElemAt: ['$part', 0] },
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      statusStats: stats,
      monthlyStats,
      topSellingParts
    });
  })
};

module.exports = carPartOrderController; 