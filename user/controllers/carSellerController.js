const CarSeller = require('../models/CarSeller');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const carSellerController = {
  createSeller: catchAsync(async (req, res) => {
    const existingSeller = await CarSeller.findOne({
      email: req.body.email
    });

    if (existingSeller) {
      throw new ApiError(400, 'Seller with this email already exists');
    }

    const seller = new CarSeller({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      businessName: req.body.businessName,
      businessType: req.body.businessType,
      licenseNumber: req.body.licenseNumber,
      taxId: req.body.taxId,
      description: req.body.description,
      operatingHours: req.body.operatingHours,
      specialties: req.body.specialties || [],
      ratings: {
        average: 0,
        count: 0
      }
    });

    if (req.files) {
      if (req.files.logo) {
        const logoPath = await fileHandler.saveFile(req.files.logo[0], 'uploads/seller-logos');
        seller.logo = logoPath;
      }
      if (req.files.documents) {
        const documents = await Promise.all(req.files.documents.map(file => 
          fileHandler.saveFile(file, 'uploads/seller-documents')
        ));
        seller.documents = documents;
      }
    }

    await seller.save();

    const response = new ResponseHandler(res);
    return response.created(seller);
  }),

  getAllSellers: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { businessType, rating, sortBy } = req.query;

    const query = {};
    if (businessType) query.businessType = businessType;
    if (rating) query['ratings.average'] = { $gte: parseFloat(rating) };

    let sort = { createdAt: -1 };
    if (sortBy === 'rating') sort = { 'ratings.average': -1 };
    if (sortBy === 'name') sort = { name: 1 };

    const sellers = await CarSeller.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await CarSeller.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      sellers,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getSellerById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const seller = await CarSeller.findById(id);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    const response = new ResponseHandler(res);
    return response.success(seller);
  }),

  updateSeller: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const seller = await CarSeller.findById(id);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    if (req.files) {
      if (req.files.logo) {
        if (seller.logo) {
          await fileHandler.deleteFile(seller.logo);
        }
        const logoPath = await fileHandler.saveFile(req.files.logo[0], 'uploads/seller-logos');
        req.body.logo = logoPath;
      }
      if (req.files.documents) {
        const newDocuments = await Promise.all(req.files.documents.map(file => 
          fileHandler.saveFile(file, 'uploads/seller-documents')
        ));
        req.body.documents = [...(seller.documents || []), ...newDocuments];
      }
    }

    const updatedSeller = await CarSeller.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    const response = new ResponseHandler(res);
    return response.success(updatedSeller);
  }),

  deleteSeller: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const seller = await CarSeller.findById(id);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    if (seller.logo) {
      await fileHandler.deleteFile(seller.logo);
    }
    if (seller.documents && seller.documents.length > 0) {
      await Promise.all(seller.documents.map(doc => 
        fileHandler.deleteFile(doc)
      ));
    }

    await seller.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  updateSellerRating: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const seller = await CarSeller.findById(id);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    const newRating = parseFloat(req.body.rating);
    if (isNaN(newRating) || newRating < 1 || newRating > 5) {
      throw new ApiError(400, 'Invalid rating value');
    }

    seller.ratings.count += 1;
    seller.ratings.average = (
      (seller.ratings.average * (seller.ratings.count - 1) + newRating) / 
      seller.ratings.count
    ).toFixed(1);

    await seller.save();

    const response = new ResponseHandler(res);
    return response.success(seller);
  }),

  searchSellers: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchQuery = {
      $or: [
        { name: new RegExp(query, 'i') },
        { businessName: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { specialties: new RegExp(query, 'i') }
      ]
    };

    const sellers = await CarSeller.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ 'ratings.average': -1 });

    const total = await CarSeller.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      sellers,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  })
};

module.exports = carSellerController; 