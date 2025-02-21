const Notification = require('../models/Notification');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');

const notificationController = {
  // Create new notification
  createNotification: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    // Validate notification type
    const validTypes = ['service_update', 'payment', 'booking', 'system', 'chat'];
    if (!validTypes.includes(req.body.type)) {
      throw new ApiError(400, 'Invalid notification type');
    }

    const notification = new Notification({
      userId: req.body.userId,
      title: req.body.title,
      message: req.body.message,
      type: req.body.type,
      referenceId: req.body.referenceId,
      referenceType: req.body.referenceType,
      priority: req.body.priority || 'normal'
    });

    await notification.save();

    // Update user's unread notification count
    await User.findByIdAndUpdate(req.body.userId, {
      $inc: { unreadNotifications: 1 }
    });

    // If notification is for multiple users
    if (req.body.userIds && Array.isArray(req.body.userIds)) {
      const bulkNotifications = req.body.userIds.map(userId => ({
        userId,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        referenceId: req.body.referenceId,
        referenceType: req.body.referenceType,
        priority: req.body.priority || 'normal'
      }));

      await Notification.insertMany(bulkNotifications);
      await User.updateMany(
        { _id: { $in: req.body.userIds } },
        { $inc: { unreadNotifications: 1 } }
      );
    }

    const populatedNotification = await Notification.findById(notification._id)
      .populate('userId', 'username email');

    const response = new ResponseHandler(res);
    return response.created(populatedNotification, 'Notification created successfully');
  }),

  // Get user's notifications
  getUserNotifications: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = { userId };

    // Filter by read status
    if (req.query.read !== undefined) {
      query.read = req.query.read === 'true';
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    const notifications = await Notification.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      notifications,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Mark notification as read
  markAsRead: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid notification ID');
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (!notification.read) {
      notification.read = true;
      notification.readAt = Date.now();
      await notification.save();

      // Decrease user's unread notification count
      await User.findByIdAndUpdate(notification.userId, {
        $inc: { unreadNotifications: -1 }
      });
    }

    const response = new ResponseHandler(res);
    return response.success(notification, 'Notification marked as read');
  }),

  // Mark all notifications as read
  markAllAsRead: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false
    });

    await Notification.updateMany(
      { userId, read: false },
      { 
        read: true,
        readAt: Date.now()
      }
    );

    // Reset user's unread notification count
    await User.findByIdAndUpdate(userId, {
      unreadNotifications: 0
    });

    const response = new ResponseHandler(res);
    return response.success({
      markedCount: unreadCount
    }, 'All notifications marked as read');
  }),

  // Delete notification
  deleteNotification: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid notification ID');
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    // If notification was unread, decrease user's unread count
    if (!notification.read) {
      await User.findByIdAndUpdate(notification.userId, {
        $inc: { unreadNotifications: -1 }
      });
    }

    await notification.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Delete all read notifications
  deleteReadNotifications: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const result = await Notification.deleteMany({
      userId,
      read: true
    });

    const response = new ResponseHandler(res);
    return response.success({
      deletedCount: result.deletedCount
    }, 'Read notifications deleted successfully');
  }),

  // Get notification statistics
  getNotificationStats: catchAsync(async (req, res) => {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          read: { $sum: { $cond: ['$read', 1, 0] } },
          unread: { $sum: { $cond: ['$read', 0, 1] } }
        }
      }
    ]);

    const priorityStats = await Notification.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          readRate: {
            $avg: { $cond: ['$read', 1, 0] }
          }
        }
      }
    ]);

    const timeStats = await Notification.aggregate([
      {
        $match: { read: true }
      },
      {
        $group: {
          _id: null,
          avgReadTime: {
            $avg: {
              $subtract: ['$readAt', '$createdAt']
            }
          }
        }
      }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      typeStats: stats,
      priorityStats,
      averageReadTime: timeStats[0]?.avgReadTime
    });
  })
};

module.exports = notificationController; 