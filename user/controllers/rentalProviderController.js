const RentalProvider = require('../models/RentalProvider');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const rentalProviderController = {
  createProvider: catchAsync(async (req, res) => {
    const existingProvider = await RentalProvider.findOne({
      email: req.body.email
    });

    if (existingProvider) {
      throw new ApiError(400, 'Provider with this email already exists');
    }

    const provider = new RentalProvider({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      businessName: req.body.businessName,
      licenseNumber: req.body.licenseNumber,
      taxId: req.body.taxId,
      description: req.body.description,
      operatingHours: req.body.operatingHours,
      rentalTerms: req.body.rentalTerms,
      insuranceDetails: req.body.insuranceDetails,
      availableVehicleTypes: req.body.availableVehicleTypes || [],
      ratings: {
        average: 0,
        count: 0
      },
      status: 'active'
    });

    if (req.files) {
      if (req.files.logo) {
        const logoPath = await fileHandler.saveFile(req.files.logo[0], 'uploads/rental-provider-logos');
        provider.logo = logoPath;
      }
      if (req.files.documents) {
        const documents = await Promise.all(req.files.documents.map(file => 
          fileHandler.saveFile(file, 'uploads/rental-provider-documents')
        ));
        provider.documents = documents;
      }
    }

    await provider.save();

    const response = new ResponseHandler(res);
    return response.created(provider);
  }),

  getAllProviders: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { vehicleType, rating, status, sortBy } = req.query;

    const query = { status: status || 'active' };
    if (vehicleType) {
      query.availableVehicleTypes = vehicleType;
    }
    if (rating) {
      query['ratings.average'] = { $gte: parseFloat(rating) };
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'rating') sort = { 'ratings.average': -1 };
    if (sortBy === 'name') sort = { name: 1 };

    const providers = await RentalProvider.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await RentalProvider.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      providers,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getProviderById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const provider = await RentalProvider.findById(id);
    if (!provider) {
      throw new ApiError(404, 'Rental provider not found');
    }

    const response = new ResponseHandler(res);
    return response.success(provider);
  }),

  updateProvider: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const provider = await RentalProvider.findById(id);
    if (!provider) {
      throw new ApiError(404, 'Rental provider not found');
    }

    if (req.files) {
      if (req.files.logo) {
        if (provider.logo) {
          await fileHandler.deleteFile(provider.logo);
        }
        const logoPath = await fileHandler.saveFile(req.files.logo[0], 'uploads/rental-provider-logos');
        req.body.logo = logoPath;
      }
      if (req.files.documents) {
        const newDocuments = await Promise.all(req.files.documents.map(file => 
          fileHandler.saveFile(file, 'uploads/rental-provider-documents')
        ));
        req.body.documents = [...(provider.documents || []), ...newDocuments];
      }
    }

    const updatedProvider = await RentalProvider.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    const response = new ResponseHandler(res);
    return response.success(updatedProvider);
  }),

  deleteProvider: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const provider = await RentalProvider.findById(id);
    if (!provider) {
      throw new ApiError(404, 'Rental provider not found');
    }

    // Soft delete
    provider.status = 'deleted';
    await provider.save();

    const response = new ResponseHandler(res);
    return response.success({ message: 'Provider deleted successfully' });
  }),

  updateProviderRating: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid provider ID');
    }

    const provider = await RentalProvider.findById(id);
    if (!provider) {
      throw new ApiError(404, 'Rental provider not found');
    }

    const newRating = parseFloat(req.body.rating);
    if (isNaN(newRating) || newRating < 1 || newRating > 5) {
      throw new ApiError(400, 'Invalid rating value');
    }

    provider.ratings.count += 1;
    provider.ratings.average = (
      (provider.ratings.average * (provider.ratings.count - 1) + newRating) / 
      provider.ratings.count
    ).toFixed(1);

    await provider.save();

    const response = new ResponseHandler(res);
    return response.success(provider);
  }),

  searchProviders: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchQuery = {
      status: 'active',
      $or: [
        { name: new RegExp(query, 'i') },
        { businessName: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { availableVehicleTypes: new RegExp(query, 'i') }
      ]
    };

    const providers = await RentalProvider.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ 'ratings.average': -1 });

    const total = await RentalProvider.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      providers,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  })
};

module.exports = rentalProviderController; 