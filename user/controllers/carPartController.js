const CarPart = require('../models/CarPart');
const CarPartOrder = require('../models/CarPartOrder');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const carPartController = {
  createCarPart: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.sellerId)) {
      throw new ApiError(400, 'Invalid seller ID');
    }

    const carPart = new CarPart(req.body);

    if (req.files && req.files.length > 0) {
      const images = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type. Only images are allowed');
        }
        return await fileHandler.saveFile(file, 'uploads/car-parts');
      }));
      carPart.images = images;
    }

    // if (req.body.specifications) {
    //   try {
        // carPart.specifications = JSON.parse(req.body.specifications);
    //   } catch (error) {
    //     throw new ApiError(400, 'Invalid specifications format');
    //   }
    // }

    await carPart.save();

    const response = new ResponseHandler(res);
    return response.created(carPart, 'Car part created successfully');
  }),

  getAllParts: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    if (query.minPrice || query.maxPrice) {
      query.price = {};
      if (query.minPrice) query.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) query.price.$lte = parseFloat(query.maxPrice);
      delete query.minPrice;
      delete query.maxPrice;
    }

    if (query.make || query.model || query.year) {
      const compatibilityRegex = new RegExp(
        `${query.make || ''}.*${query.model || ''}.*${query.year || ''}`, 'i'
      );
      query.compatibility = compatibilityRegex;
      delete query.make;
      delete query.model;
      delete query.year;
    }

    const parts = await CarPart.find(query)
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'businessName contactInfo')
      .sort({ createdAt: -1 });

    const total = await CarPart.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      parts,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getPartById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid part ID');
    }

    const part = await CarPart.findById(req.params.id)
      .populate('sellerId', 'businessName contactInfo address');

    if (!part) {
      throw new ApiError(404, 'Car part not found');
    }

    const relatedParts = await CarPart.find({
      category: part.category,
      _id: { $ne: part._id }
    })
      .limit(5)
      .select('name brand price images');

    const response = new ResponseHandler(res);
    return response.success({
      part,
      relatedParts
    });
  }),

  updatePart: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid part ID');
    }

    const part = await CarPart.findById(req.params.id);
    if (!part) {
      throw new ApiError(404, 'Car part not found');
    }

    if (req.files && req.files.length > 0) {
      if (part.images && part.images.length > 0) {
        await Promise.all(part.images.map(image => 
          fileHandler.deleteFile(image)
        ));
      }

      const images = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type. Only images are allowed');
        }
        return await fileHandler.saveFile(file, 'uploads/car-parts');
      }));
      req.body.images = images;
    }

    if (req.body.specifications) {
      try {
        req.body.specifications = JSON.parse(req.body.specifications);
      } catch (error) {
        throw new ApiError(400, 'Invalid specifications format');
      }
    }

    const updatedPart = await CarPart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('sellerId', 'businessName contactInfo');

    const response = new ResponseHandler(res);
    return response.success(updatedPart, 'Car part updated successfully');
  }),

  deletePart: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid part ID');
    }

    const part = await CarPart.findById(req.params.id);
    if (!part) {
      throw new ApiError(404, 'Car part not found');
    }

    const pendingOrders = await CarPartOrder.findOne({
      'items.partId': part._id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (pendingOrders) {
      throw new ApiError(400, 'Cannot delete part with pending orders');
    }

    if (part.images && part.images.length > 0) {
      await Promise.all(part.images.map(image => 
        fileHandler.deleteFile(image)
      ));
    }

    await part.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  searchParts: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchRegex = new RegExp(query, 'i');
    const searchQuery = {
      $or: [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { compatibility: searchRegex }
      ]
    };

    const parts = await CarPart.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'businessName contactInfo')
      .sort({ createdAt: -1 });

    const total = await CarPart.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      parts,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getPartsByCategory: catchAsync(async (req, res) => {
    const { category } = req.params;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const parts = await CarPart.find({ category })
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'businessName contactInfo')
      .sort({ createdAt: -1 });

    const total = await CarPart.countDocuments({ category });

    const response = new ResponseHandler(res);
    return response.success({
      parts,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getPartStats: catchAsync(async (req, res) => {
    const stats = await CarPart.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
        }
      }
    ]);

    const brandStats = await CarPart.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      categoryStats: stats,
      topBrands: brandStats
    });
  })
};

module.exports = carPartController;