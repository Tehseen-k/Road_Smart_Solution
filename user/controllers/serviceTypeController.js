const ServiceType = require('../models/ServiceType');
const ServiceSubcategory = require('../models/ServiceSubcategory');
const ServiceRequest = require('../models/ServiceRequest');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const serviceTypeController = {
  // Create new service type
  createServiceType: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.subcategoryId)) {
      throw new ApiError(400, 'Invalid subcategory ID');
    }

    const existingType = await ServiceType.findOne({
      name: req.body.name,
      subcategoryId: req.body.subcategoryId
    });

    if (existingType) {
      throw new ApiError(400, 'Service type already exists in this subcategory');
    }

    const serviceType = new ServiceType({
      name: req.body.name,
      description: req.body.description,
      subcategoryId: req.body.subcategoryId,
      standardPrice: req.body.standardPrice,
      estimatedTime: req.body.estimatedTime,
      requirements: req.body.requirements || [],
      materials: req.body.materials || []
    });

    if (req.file) {
      const imagePath = await fileHandler.saveFile(req.file, 'uploads/service-type-images');
      serviceType.image = imagePath;
    }

    await serviceType.save();

    const populatedType = await ServiceType.findById(serviceType._id)
      .populate('subcategoryId');

    const response = new ResponseHandler(res);
    return response.created(populatedType);
  }),

  // Get all service types
  getAllServiceTypes: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    if (query.priceRange) {
      const [min, max] = query.priceRange.split('-');
      query.standardPrice = { $gte: min, $lte: max };
      delete query.priceRange;
    }

    const serviceTypes = await ServiceType.find(query)
      .skip(skip)
      .limit(limit)
      .populate('subcategoryId')
      .sort({ name: 1 });

    const total = await ServiceType.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      serviceTypes,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get service type by ID
  getServiceTypeById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service type ID');
    }

    const serviceType = await ServiceType.findById(id)
      .populate('subcategoryId');

    if (!serviceType) {
      throw new ApiError(404, 'Service type not found');
    }

    const requestCount = await ServiceRequest.countDocuments({
      serviceTypeId: id
    });

    const response = new ResponseHandler(res);
    return response.success({
      serviceType,
      requestCount
    });
  }),

  // Update service type
  updateServiceType: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service type ID');
    }

    const serviceType = await ServiceType.findById(id);
    if (!serviceType) {
      throw new ApiError(404, 'Service type not found');
    }

    if (req.file) {
      if (serviceType.image) {
        await fileHandler.deleteFile(serviceType.image);
      }
      const imagePath = await fileHandler.saveFile(req.file, 'uploads/service-type-images');
      req.body.image = imagePath;
    }

    const updatedType = await ServiceType.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subcategoryId');

    const response = new ResponseHandler(res);
    return response.success(updatedType);
  }),

  // Delete service type
  deleteServiceType: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service type ID');
    }

    const serviceType = await ServiceType.findById(id);
    if (!serviceType) {
      throw new ApiError(404, 'Service type not found');
    }

    const activeRequests = await ServiceRequest.countDocuments({
      serviceTypeId: id,
      status: { $in: ['pending', 'in_progress'] }
    });

    if (activeRequests > 0) {
      throw new ApiError(400, 'Cannot delete service type with active requests');
    }

    if (serviceType.image) {
      await fileHandler.deleteFile(serviceType.image);
    }

    await serviceType.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Get service types by subcategory
  getServiceTypesBySubcategory: catchAsync(async (req, res) => {
    const { subcategoryId } = req.params;
    if (!validationHelper.isValidId(subcategoryId)) {
      throw new ApiError(400, 'Invalid subcategory ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const serviceTypes = await ServiceType.find({ subcategoryId })
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await ServiceType.countDocuments({ subcategoryId });

    const response = new ResponseHandler(res);
    return response.success({
      serviceTypes,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Search service types
  searchServiceTypes: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchQuery = {
      $or: [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') }
      ]
    };

    const serviceTypes = await ServiceType.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .populate('subcategoryId')
      .sort({ name: 1 });

    const total = await ServiceType.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      serviceTypes,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get service type statistics
  getServiceTypeStats: catchAsync(async (req, res) => {
    const stats = await ServiceType.aggregate([
      {
        $group: {
          _id: '$subcategoryId',
          count: { $sum: 1 },
          avgPrice: { $avg: '$standardPrice' },
          minPrice: { $min: '$standardPrice' },
          maxPrice: { $max: '$standardPrice' }
        }
      },
      {
        $lookup: {
          from: 'servicesubcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'subcategory'
        }
      },
      {
        $project: {
          subcategory: { $arrayElemAt: ['$subcategory.name', 0] },
          count: 1,
          avgPrice: 1,
          minPrice: 1,
          maxPrice: 1
        }
      }
    ]);

    const popularServices = await ServiceType.aggregate([
      {
        $lookup: {
          from: 'servicerequests',
          localField: '_id',
          foreignField: 'serviceTypeId',
          as: 'requests'
        }
      },
      {
        $project: {
          serviceName: 1,
          requestCount: { $size: '$requests' }
        }
      },
      { $sort: { requestCount: -1 } },
      { $limit: 10 }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      categoryStats: stats,
      popularServices
    });
  })
};

module.exports = serviceTypeController; 