const UserCarServiceHistory = require('../models/UserCarServiceHistory');
const UserCar = require('../models/UserCar');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const userCarServiceHistoryController = {
  createServiceRecord: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const userCar = await UserCar.findById(req.body.userCarId);
    if (!userCar) {
      throw new ApiError(404, 'User car not found');
    }

    const serviceRecord = new UserCarServiceHistory({
      userCarId: req.body.userCarId,
      serviceType: req.body.serviceType,
      serviceDate: req.body.serviceDate,
      mileage: req.body.mileage,
      serviceProvider: req.body.serviceProvider,
      description: req.body.description,
      partsReplaced: req.body.partsReplaced || [],
      cost: req.body.cost,
      laborCost: req.body.laborCost,
      partsCost: req.body.partsCost,
      recommendations: req.body.recommendations || [],
      nextServiceDue: req.body.nextServiceDue,
      warranty: req.body.warranty
    });

    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/service-history-documents')
      ));
      serviceRecord.documents = documents.map(path => ({
        url: path,
        type: 'service_record'
      }));
    }

    await serviceRecord.save();

    // Update car's last service date and mileage
    await UserCar.findByIdAndUpdate(req.body.userCarId, {
      lastServiceDate: req.body.serviceDate,
      lastServiceMileage: req.body.mileage
    });

    const populatedRecord = await UserCarServiceHistory.findById(serviceRecord._id)
      .populate('userCarId');

    const response = new ResponseHandler(res);
    return response.created(populatedRecord);
  }),

  getCarServiceHistory: catchAsync(async (req, res) => {
    const { userCarId } = req.params;
    if (!validationHelper.isValidId(userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { serviceType, startDate, endDate, sortBy } = req.query;

    const query = { userCarId };
    if (serviceType) query.serviceType = serviceType;
    if (startDate || endDate) {
      query.serviceDate = {};
      if (startDate) query.serviceDate.$gte = new Date(startDate);
      if (endDate) query.serviceDate.$lte = new Date(endDate);
    }

    let sort = { serviceDate: -1 };
    if (sortBy === 'mileage') sort = { mileage: -1 };
    if (sortBy === 'cost') sort = { cost: -1 };

    const serviceHistory = await UserCarServiceHistory.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userCarId')
      .sort(sort);

    const total = await UserCarServiceHistory.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      serviceHistory,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getServiceRecordById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service record ID');
    }

    const serviceRecord = await UserCarServiceHistory.findById(id)
      .populate('userCarId');

    if (!serviceRecord) {
      throw new ApiError(404, 'Service record not found');
    }

    const response = new ResponseHandler(res);
    return response.success(serviceRecord);
  }),

  updateServiceRecord: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service record ID');
    }

    const serviceRecord = await UserCarServiceHistory.findById(id);
    if (!serviceRecord) {
      throw new ApiError(404, 'Service record not found');
    }

    if (req.files && req.files.length > 0) {
      const newDocuments = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/service-history-documents')
      ));
      req.body.documents = [
        ...(serviceRecord.documents || []),
        ...newDocuments.map(path => ({
          url: path,
          type: 'service_record'
        }))
      ];
    }

    const updatedRecord = await UserCarServiceHistory.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userCarId');

    // Update car's last service info if this is the most recent service
    const mostRecentService = await UserCarServiceHistory.findOne({
      userCarId: serviceRecord.userCarId
    }).sort({ serviceDate: -1 });

    if (mostRecentService._id.toString() === id) {
      await UserCar.findByIdAndUpdate(serviceRecord.userCarId, {
        lastServiceDate: req.body.serviceDate || serviceRecord.serviceDate,
        lastServiceMileage: req.body.mileage || serviceRecord.mileage
      });
    }

    const response = new ResponseHandler(res);
    return response.success(updatedRecord);
  }),

  deleteServiceRecord: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service record ID');
    }

    const serviceRecord = await UserCarServiceHistory.findById(id);
    if (!serviceRecord) {
      throw new ApiError(404, 'Service record not found');
    }

    // Delete associated documents
    if (serviceRecord.documents && serviceRecord.documents.length > 0) {
      await Promise.all(serviceRecord.documents.map(doc => 
        fileHandler.deleteFile(doc.url)
      ));
    }

    await serviceRecord.remove();

    // Update car's last service info
    const mostRecentService = await UserCarServiceHistory.findOne({
      userCarId: serviceRecord.userCarId
    }).sort({ serviceDate: -1 });

    if (mostRecentService) {
      await UserCar.findByIdAndUpdate(serviceRecord.userCarId, {
        lastServiceDate: mostRecentService.serviceDate,
        lastServiceMileage: mostRecentService.mileage
      });
    }

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  getServiceStats: catchAsync(async (req, res) => {
    const { userCarId } = req.params;
    if (!validationHelper.isValidId(userCarId)) {
      throw new ApiError(400, 'Invalid user car ID');
    }

    const stats = await UserCarServiceHistory.aggregate([
      { $match: { userCarId: userCarId } },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          totalCost: { $sum: '$cost' },
          averageCost: { $avg: '$cost' },
          mostCommonService: { $mode: '$serviceType' },
          lastServiceDate: { $max: '$serviceDate' },
          totalPartsReplaced: { $sum: { $size: '$partsReplaced' } }
        }
      }
    ]);

    const serviceTypeBreakdown = await UserCarServiceHistory.aggregate([
      { $match: { userCarId: userCarId } },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' }
        }
      }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      summary: stats[0] || {},
      serviceTypeBreakdown
    });
  }),

  addServiceDocument: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service record ID');
    }

    if (!req.file) {
      throw new ApiError(400, 'No document provided');
    }

    const serviceRecord = await UserCarServiceHistory.findById(id);
    if (!serviceRecord) {
      throw new ApiError(404, 'Service record not found');
    }

    const documentPath = await fileHandler.saveFile(req.file, 'uploads/service-history-documents');
    
    serviceRecord.documents.push({
      url: documentPath,
      type: req.body.documentType || 'service_record',
      description: req.body.description
    });

    await serviceRecord.save();

    const response = new ResponseHandler(res);
    return response.success(serviceRecord);
  })
};

module.exports = userCarServiceHistoryController; 