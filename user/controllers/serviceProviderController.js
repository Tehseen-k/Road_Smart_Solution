const ServiceProvider = require('../models/ServiceProvider');
const ProviderService = require('../models/ProviderService');
const ServiceType = require('../models/ServiceType');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const serviceProviderController = {
  // Create service provider
  createServiceProvider: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const existingProvider = await ServiceProvider.findOne({ userId: req.body.userId });
    if (existingProvider) {
      throw new ApiError(400, 'Service provider already exists for this user');
    }

    const serviceProvider = new ServiceProvider(req.body);
    await serviceProvider.save();

    // Handle services if provided
    if (req.body.services && Array.isArray(req.body.services)) {
      const validServices = req.body.services.every(service => 
        validationHelper.isValidId(service.serviceType)
      );

      if (!validServices) {
        throw new ApiError(400, 'Invalid service type ID provided');
      }

      const providerServices = req.body.services.map(service => ({
        providerId: serviceProvider._id,
        serviceTypeId: service.serviceTypeId,
        price: service.price
      }));

      await ProviderService.insertMany(providerServices);
    }

    const populatedProvider = await ServiceProvider.findById(serviceProvider._id)
      .populate('userId')
      .populate({
        path: 'services',
        populate: {
          path: 'serviceTypeId'
        }
      });

    const response = new ResponseHandler(res);
    return response.created(populatedProvider, 'Service provider created successfully');
  }),

  // Get all providers
  getAllProviders: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    // Apply filters
    if (query.serviceType && validationHelper.isValidId(query.serviceType)) {
      const providers = await ProviderService.find({ 
        serviceTypeId: query.serviceType 
      }).distinct('providerId');
      query._id = { $in: providers };
    }

    if (query.rating) {
      query.ratings = { $gte: parseFloat(query.rating) };
    }

    const providers = await ServiceProvider.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId')
      .populate({
        path: 'services',
        populate: {
          path: 'serviceTypeId'
        }
      });

    const total = await ServiceProvider.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      providers,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get provider by ID
  getProviderById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const provider = await ServiceProvider.findById(req.params.id)
      .populate('userId')
      .populate({
        path: 'services',
        populate: {
          path: 'serviceTypeId'
        }
      });

    if (!provider) {
      throw new ApiError(404, 'Service provider not found');
    }

    const response = new ResponseHandler(res);
    return response.success(provider);
  }),

  // Update provider
  updateProvider: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!provider) {
      throw new ApiError(404, 'Service provider not found');
    }

    // Update services if provided
    if (req.body.services && Array.isArray(req.body.services)) {
      const validServices = req.body.services.every(service => 
        validationHelper.isValidId(service.serviceType)
      );

      if (!validServices) {
        throw new ApiError(400, 'Invalid service type ID provided');
      }

      await ProviderService.deleteMany({ providerId: provider._id });

      const providerServices = req.body.services.map(service => ({
        providerId: provider._id,
        serviceTypeId: service.serviceTypeId,
        price: service.price
      }));

      await ProviderService.insertMany(providerServices);
    }

    const updatedProvider = await ServiceProvider.findById(provider._id)
      .populate('userId')
      .populate({
        path: 'services',
        populate: {
          path: 'serviceTypeId'
        }
      });

    const response = new ResponseHandler(res);
    return response.success(updatedProvider, 'Provider updated successfully');
  }),

  // Delete provider
  deleteProvider: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) {
      throw new ApiError(404, 'Service provider not found');
    }

    // Delete associated services
    await ProviderService.deleteMany({ providerId: provider._id });
    await ServiceProvider.deleteOne({ _id: provider._id });

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Add service to provider
  addService: catchAsync(async (req, res) => {
    const { providerId } = req.params;
    const { serviceType, price } = req.body;

    // Check if provider exists
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      throw new ApiError(404, 'Service provider not found');
    }

    // Check if service type exists
    const serviceTypee = await ServiceType.findById(serviceType);
    if (!serviceTypee) {
      throw new ApiError(404, 'Service type not found');
    }

    // Check if service already exists
    const existingService = await ProviderService.findOne({
      providerId,
      serviceType
    });

    if (existingService) {
      throw new ApiError(400, 'Service already exists for this provider');
    }

    const providerService = new ProviderService({
      providerId,
      serviceType,
      price
    });

    await providerService.save();

    res.status(201).json({
      status: 'success',
      data: providerService
    });
  }),

  // Remove service from provider
  removeService: catchAsync(async (req, res) => {
    const { providerId, serviceId } = req.params;

    const result = await ProviderService.findOneAndDelete({
      providerId,
      _id: serviceId
    });

    if (!result) {
      throw new ApiError(404, 'Service not found for this provider');
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }),

  // Search providers
  searchProviders: catchAsync(async (req, res) => {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');

    const providers = await ServiceProvider.find({
      $or: [
        { providerName: searchRegex },
        { about: searchRegex },
        { address: searchRegex }
      ]
    }).populate('userId')
      .populate({
        path: 'services',
        populate: {
          path: 'serviceTypeId'
        }
      });

    res.status(200).json({
      status: 'success',
      data: providers
    });
  }),

  // Get provider statistics
  getProviderStats: catchAsync(async (req, res) => {
    const { providerId } = req.params;

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      throw new ApiError(404, 'Service provider not found');
    }

    const stats = await ProviderService.aggregate([
      {
        $match: { providerId: provider._id }
      },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: stats[0] || {
        totalServices: 0,
        averagePrice: 0,
        maxPrice: 0,
        minPrice: 0
      }
    });
  })
};

module.exports = serviceProviderController; 