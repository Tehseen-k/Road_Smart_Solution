const ProviderService = require('../models/ProviderService');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const providerServiceController = {
  createService: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.providerId) || 
        !validationHelper.isValidId(req.body.serviceTypeId)) {
      throw new ApiError(400, 'Invalid provider ID or service type ID');
    }

    const existingService = await ProviderService.findOne({
      providerId: req.body.providerId,
      serviceTypeId: req.body.serviceTypeId
    });

    if (existingService) {
      throw new ApiError(400, 'Service already exists for this provider');
    }

    const service = new ProviderService({
      providerId: req.body.providerId,
      serviceTypeId: req.body.serviceTypeId,
      price: req.body.price,
      duration: req.body.duration,
      description: req.body.description,
      availability: req.body.availability || [],
      requirements: req.body.requirements || [],
      customization: req.body.customization || {},
      status: 'active'
    });

    if (req.files && req.files.length > 0) {
      const images = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/service-images')
      ));
      service.images = images;
    }

    await service.save();

    const populatedService = await ProviderService.findById(service._id)
      .populate('providerId')
      .populate('serviceTypeId');

    const response = new ResponseHandler(res);
    return response.created(populatedService);
  }),

  getProviderServices: catchAsync(async (req, res) => {
    const { providerId } = req.params;
    if (!validationHelper.isValidId(providerId)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { status, serviceType } = req.query;

    const query = { 
      providerId,
      status: status || 'active'
    };
    if (serviceType) query.serviceTypeId = serviceType;

    const services = await ProviderService.find(query)
      .skip(skip)
      .limit(limit)
      .populate('serviceTypeId')
      .sort({ createdAt: -1 });

    const total = await ProviderService.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      services,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getServiceById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service ID');
    }

    const service = await ProviderService.findById(id)
      .populate('providerId')
      .populate('serviceTypeId');

    if (!service) {
      throw new ApiError(404, 'Provider service not found');
    }

    const response = new ResponseHandler(res);
    return response.success(service);
  }),

  updateService: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service ID');
    }

    const service = await ProviderService.findById(id);
    if (!service) {
      throw new ApiError(404, 'Provider service not found');
    }

    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/service-images')
      ));
      req.body.images = [...(service.images || []), ...newImages];
    }

    const updatedService = await ProviderService.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('providerId')
      .populate('serviceTypeId');

    const response = new ResponseHandler(res);
    return response.success(updatedService);
  }),

  deleteService: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service ID');
    }

    const service = await ProviderService.findById(id);
    if (!service) {
      throw new ApiError(404, 'Provider service not found');
    }

    // Soft delete
    service.status = 'deleted';
    await service.save();

    const response = new ResponseHandler(res);
    return response.success({ message: 'Service deleted successfully' });
  }),

  updateAvailability: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service ID');
    }

    const service = await ProviderService.findById(id);
    if (!service) {
      throw new ApiError(404, 'Provider service not found');
    }

    service.availability = req.body.availability;
    await service.save();

    const response = new ResponseHandler(res);
    return response.success(service);
  }),

  updatePricing: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid service ID');
    }

    const service = await ProviderService.findById(id);
    if (!service) {
      throw new ApiError(404, 'Provider service not found');
    }

    service.price = req.body.price;
    service.customization = req.body.customization || service.customization;
    await service.save();

    const response = new ResponseHandler(res);
    return response.success(service);
  }),

  searchServices: catchAsync(async (req, res) => {
    const { query, serviceType, maxPrice } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchQuery = {
      status: 'active',
      $or: [
        { description: new RegExp(query, 'i') }
      ]
    };

    if (serviceType) {
      searchQuery.serviceTypeId = serviceType;
    }

    if (maxPrice) {
      searchQuery.price = { $lte: parseFloat(maxPrice) };
    }

    const services = await ProviderService.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .populate('providerId')
      .populate('serviceTypeId')
      .sort({ price: 1 });

    const total = await ProviderService.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      services,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  })
};

module.exports = providerServiceController; 