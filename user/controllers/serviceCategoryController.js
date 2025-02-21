const ServiceCategory = require('../models/ServiceCategory');
const ServiceSubcategory = require('../models/ServiceSubcategory');
const ServiceType = require('../models/ServiceType');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const serviceCategoryController = {
  // Create new category
  createCategory: catchAsync(async (req, res) => {
    const existingCategory = await ServiceCategory.findOne({
      name: req.body.name
    });

    if (existingCategory) {
      throw new ApiError(400, 'Category with this name already exists');
    }

    const category = new ServiceCategory({
      name: req.body.name,
      description: req.body.description,
      displayOrder: req.body.displayOrder || 0
    });

    // Handle category icon
    if (req.file) {
      if (!fileHandler.isValidFileType(req.file, ['.jpg', '.jpeg', '.png'])) {
        throw new ApiError(400, 'Invalid file type. Only images are allowed');
      }
      const iconPath = await fileHandler.saveFile(req.file, 'uploads/category-icons');
      category.icon = iconPath;
    }

    await category.save();

    const response = new ResponseHandler(res);
    return response.created(category, 'Service category created successfully');
  }),

  // Get all categories
  getAllCategories: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery(req.query);
    delete query.page;
    delete query.limit;

    let categories;
    let total;

    if (req.query.includeSubcategories === 'true') {
      categories = await ServiceCategory.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 });

      // Get subcategories for each category
      const categoriesWithSubs = await Promise.all(categories.map(async (category) => {
        const subcategories = await ServiceSubcategory.find({ categoryId: category._id })
          .select('name description icon');
        return {
          ...category.toObject(),
          subcategories
        };
      }));

      total = await ServiceCategory.countDocuments(query);
      categories = categoriesWithSubs;
    } else {
      categories = await ServiceCategory.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ displayOrder: 1, name: 1 });

      total = await ServiceCategory.countDocuments(query);
    }

    const response = new ResponseHandler(res);
    return response.success({
      categories,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get category by ID
  getCategoryById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid category ID');
    }

    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Get subcategories
    const subcategories = await ServiceSubcategory.find({ categoryId: category._id });

    // Get service types count for each subcategory
    const subcategoriesWithCounts = await Promise.all(subcategories.map(async (sub) => {
      const serviceTypesCount = await ServiceType.countDocuments({ subcategoryId: sub._id });
      return {
        ...sub.toObject(),
        serviceTypesCount
      };
    }));

    const response = new ResponseHandler(res);
    return response.success({
      category,
      subcategories: subcategoriesWithCounts
    });
  }),

  // Update category
  updateCategory: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid category ID');
    }

    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Check name uniqueness if name is being updated
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await ServiceCategory.findOne({
        name: req.body.name,
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        throw new ApiError(400, 'Category with this name already exists');
      }
    }

    // Handle icon update
    if (req.file) {
      if (!fileHandler.isValidFileType(req.file, ['.jpg', '.jpeg', '.png'])) {
        throw new ApiError(400, 'Invalid file type. Only images are allowed');
      }

      // Delete old icon
      if (category.icon) {
        await fileHandler.deleteFile(category.icon);
      }

      const iconPath = await fileHandler.saveFile(req.file, 'uploads/category-icons');
      req.body.icon = iconPath;
    }

    const updatedCategory = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const response = new ResponseHandler(res);
    return response.success(updatedCategory, 'Category updated successfully');
  }),

  // Delete category
  deleteCategory: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid category ID');
    }

    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Check if category has subcategories
    const subcategoriesCount = await ServiceSubcategory.countDocuments({
      categoryId: category._id
    });

    if (subcategoriesCount > 0) {
      throw new ApiError(400, 'Cannot delete category with existing subcategories');
    }

    // Delete category icon
    if (category.icon) {
      await fileHandler.deleteFile(category.icon);
    }

    await category.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Reorder categories
  reorderCategories: catchAsync(async (req, res) => {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      throw new ApiError(400, 'Invalid order data');
    }

    // Validate order data
    orders.forEach(order => {
      if (!validationHelper.isValidId(order.categoryId)) {
        throw new ApiError(400, 'Invalid category ID in order data');
      }
    });

    // Update display orders
    await Promise.all(orders.map(order =>
      ServiceCategory.findByIdAndUpdate(order.categoryId, {
        displayOrder: order.order
      })
    ));

    const updatedCategories = await ServiceCategory.find()
      .sort({ displayOrder: 1, name: 1 });

    const response = new ResponseHandler(res);
    return response.success(updatedCategories, 'Categories reordered successfully');
  }),

  // Get category statistics
  getCategoryStats: catchAsync(async (req, res) => {
    const stats = await ServiceCategory.aggregate([
      {
        $lookup: {
          from: 'servicesubcategories',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'subcategories'
        }
      },
      {
        $lookup: {
          from: 'servicetypes',
          localField: 'subcategories._id',
          foreignField: 'subcategoryId',
          as: 'serviceTypes'
        }
      },
      {
        $project: {
          name: 1,
          subcategoriesCount: { $size: '$subcategories' },
          serviceTypesCount: { $size: '$serviceTypes' },
          averagePrice: { $avg: '$serviceTypes.standardPrice' }
        }
      }
    ]);

    const popularCategories = await ServiceCategory.aggregate([
      {
        $lookup: {
          from: 'servicesubcategories',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'subcategories'
        }
      },
      {
        $lookup: {
          from: 'servicetypes',
          localField: 'subcategories._id',
          foreignField: 'subcategoryId',
          as: 'serviceTypes'
        }
      },
      {
        $lookup: {
          from: 'servicerequests',
          localField: 'serviceTypes._id',
          foreignField: 'serviceTypeId',
          as: 'requests'
        }
      },
      {
        $project: {
          name: 1,
          requestCount: { $size: '$requests' }
        }
      },
      { $sort: { requestCount: -1 } },
      { $limit: 5 }
    ]);

    const response = new ResponseHandler(res);
    return response.success({
      categoryStats: stats,
      popularCategories
    });
  })
};

module.exports = serviceCategoryController; 