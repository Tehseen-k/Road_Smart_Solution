const ServiceSubcategory = require('../models/ServiceSubcategory');
const ServiceType = require('../models/ServiceType');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const serviceSubcategoryController = {
  // Create new subcategory
  createSubcategory: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.categoryId)) {
      throw new ApiError(400, 'Invalid category ID');
    }

    const existingSubcategory = await ServiceSubcategory.findOne({
      name: req.body.name,
      categoryId: req.body.categoryId
    });

    if (existingSubcategory) {
      throw new ApiError(400, 'Subcategory with this name already exists in the category');
    }

    const subcategory = new ServiceSubcategory({
      name: req.body.name,
      categoryId: req.body.categoryId,
      description: req.body.description
    });

    // Handle icon upload
    if (req.file) {
      if (!fileHandler.isValidFileType(req.file, ['.jpg', '.jpeg', '.png'])) {
        throw new ApiError(400, 'Invalid file type. Only images are allowed');
      }
      const iconPath = await fileHandler.saveFile(req.file, 'uploads/subcategory-icons');
      subcategory.icon = iconPath;
    }

    await subcategory.save();

    const populatedSubcategory = await ServiceSubcategory.findById(subcategory._id)
      .populate('categoryId');

    const response = new ResponseHandler(res);
    return response.created(populatedSubcategory, 'Subcategory created successfully');
  }),

  // Get all subcategories
  getAllSubcategories: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    const subcategories = await ServiceSubcategory.find(query)
      .skip(skip)
      .limit(limit)
      .populate('categoryId')
      .sort({ name: 1 });

    const total = await ServiceSubcategory.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      subcategories,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get subcategory by ID
  getSubcategoryById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid subcategory ID');
    }

    const subcategory = await ServiceSubcategory.findById(req.params.id)
      .populate('categoryId');

    if (!subcategory) {
      throw new ApiError(404, 'Subcategory not found');
    }

    // Get service types in this subcategory
    const serviceTypes = await ServiceType.find({ subcategoryId: subcategory._id })
      .select('serviceName description standardPrice');

    const response = new ResponseHandler(res);
    return response.success({
      subcategory,
      serviceTypes
    });
  }),

  // Update subcategory
  updateSubcategory: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid subcategory ID');
    }

    const subcategory = await ServiceSubcategory.findById(req.params.id);
    if (!subcategory) {
      throw new ApiError(404, 'Subcategory not found');
    }

    // Check for name uniqueness if name is being updated
    if (req.body.name && req.body.name !== subcategory.name) {
      const existingSubcategory = await ServiceSubcategory.findOne({
        name: req.body.name,
        categoryId: subcategory.categoryId,
        _id: { $ne: subcategory._id }
      });

      if (existingSubcategory) {
        throw new ApiError(400, 'Subcategory with this name already exists in the category');
      }
    }

    // Handle icon update
    if (req.file) {
      if (!fileHandler.isValidFileType(req.file, ['.jpg', '.jpeg', '.png'])) {
        throw new ApiError(400, 'Invalid file type. Only images are allowed');
      }

      // Delete old icon
      if (subcategory.icon) {
        await fileHandler.deleteFile(subcategory.icon);
      }

      const iconPath = await fileHandler.saveFile(req.file, 'uploads/subcategory-icons');
      req.body.icon = iconPath;
    }

    const updatedSubcategory = await ServiceSubcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId');

    const response = new ResponseHandler(res);
    return response.success(updatedSubcategory, 'Subcategory updated successfully');
  }),

  // Delete subcategory
  deleteSubcategory: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid subcategory ID');
    }

    const subcategory = await ServiceSubcategory.findById(req.params.id);
    if (!subcategory) {
      throw new ApiError(404, 'Subcategory not found');
    }

    // Check if there are any service types using this subcategory
    const serviceTypesCount = await ServiceType.countDocuments({
      subcategoryId: subcategory._id
    });

    if (serviceTypesCount > 0) {
      throw new ApiError(400, 'Cannot delete subcategory with existing service types');
    }

    // Delete icon if exists
    if (subcategory.icon) {
      await fileHandler.deleteFile(subcategory.icon);
    }

    await subcategory.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Get subcategories by category
  getSubcategoriesByCategory: catchAsync(async (req, res) => {
    const { categoryId } = req.params;
    if (!validationHelper.isValidId(categoryId)) {
      throw new ApiError(400, 'Invalid category ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const subcategories = await ServiceSubcategory.find({ categoryId })
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await ServiceSubcategory.countDocuments({ categoryId });

    const response = new ResponseHandler(res);
    return response.success({
      subcategories,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Search subcategories
  searchSubcategories: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchRegex = new RegExp(query, 'i');
    const searchQuery = {
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    };

    const subcategories = await ServiceSubcategory.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .populate('categoryId')
      .sort({ name: 1 });

    const total = await ServiceSubcategory.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      subcategories,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get subcategory statistics
  getSubcategoryStats: catchAsync(async (req, res) => {
    const stats = await ServiceSubcategory.aggregate([
      {
        $lookup: {
          from: 'servicetypes',
          localField: '_id',
          foreignField: 'subcategoryId',
          as: 'serviceTypes'
        }
      },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          serviceTypesCount: { $sum: { $size: '$serviceTypes' } }
        }
      },
      {
        $lookup: {
          from: 'servicecategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $project: {
          category: { $arrayElemAt: ['$category.name', 0] },
          subcategoriesCount: '$count',
          serviceTypesCount: 1
        }
      }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      categoryStats: stats
    });
  })
};

module.exports = serviceSubcategoryController; 