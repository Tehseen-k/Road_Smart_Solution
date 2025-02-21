const VehicleSpecialProduct = require('../models/VehicleSpecialProduct');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const vehicleSpecialProductController = {
  createProduct: catchAsync(async (req, res) => {
    const existingProduct = await VehicleSpecialProduct.findOne({
      name: req.body.name,
      manufacturer: req.body.manufacturer
    });

    if (existingProduct) {
      throw new ApiError(400, 'Product with this name and manufacturer already exists');
    }

    const product = new VehicleSpecialProduct({
      name: req.body.name,
      description: req.body.description,
      manufacturer: req.body.manufacturer,
      category: req.body.category,
      type: req.body.type,
      compatibleModels: req.body.compatibleModels || [],
      specifications: req.body.specifications || {},
      features: req.body.features || [],
      price: req.body.price,
      stockQuantity: req.body.stockQuantity,
      minStockLevel: req.body.minStockLevel,
      warrantyInfo: req.body.warrantyInfo,
      installationGuide: req.body.installationGuide,
      status: 'active'
    });

    if (req.files) {
      if (req.files.images) {
        const images = await Promise.all(req.files.images.map(file => 
          fileHandler.saveFile(file, 'uploads/special-product-images')
        ));
        product.images = images;
      }
      if (req.files.manual) {
        const manualPath = await fileHandler.saveFile(req.files.manual[0], 'uploads/special-product-manuals');
        product.manualUrl = manualPath;
      }
    }

    await product.save();

    const response = new ResponseHandler(res);
    return response.created(product);
  }),

  getAllProducts: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { category, type, manufacturer, inStock, sortBy } = req.query;

    const query = { status: 'active' };
    if (category) query.category = category;
    if (type) query.type = type;
    if (manufacturer) query.manufacturer = manufacturer;
    if (inStock === 'true') query.stockQuantity = { $gt: 0 };

    let sort = { createdAt: -1 };
    if (sortBy === 'price') sort = { price: 1 };
    if (sortBy === 'name') sort = { name: 1 };
    if (sortBy === 'stock') sort = { stockQuantity: -1 };

    const products = await VehicleSpecialProduct.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await VehicleSpecialProduct.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      products,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getProductById: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid product ID');
    }

    const product = await VehicleSpecialProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Special product not found');
    }

    const response = new ResponseHandler(res);
    return response.success(product);
  }),

  updateProduct: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid product ID');
    }

    const product = await VehicleSpecialProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Special product not found');
    }

    if (req.files) {
      if (req.files.images) {
        const newImages = await Promise.all(req.files.images.map(file => 
          fileHandler.saveFile(file, 'uploads/special-product-images')
        ));
        req.body.images = [...(product.images || []), ...newImages];
      }
      if (req.files.manual) {
        if (product.manualUrl) {
          await fileHandler.deleteFile(product.manualUrl);
        }
        const manualPath = await fileHandler.saveFile(req.files.manual[0], 'uploads/special-product-manuals');
        req.body.manualUrl = manualPath;
      }
    }

    const updatedProduct = await VehicleSpecialProduct.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    const response = new ResponseHandler(res);
    return response.success(updatedProduct);
  }),

  deleteProduct: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid product ID');
    }

    const product = await VehicleSpecialProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Special product not found');
    }

    // Soft delete
    product.status = 'deleted';
    await product.save();

    const response = new ResponseHandler(res);
    return response.success({ message: 'Product deleted successfully' });
  }),

  updateStock: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid product ID');
    }

    const product = await VehicleSpecialProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Special product not found');
    }

    const newQuantity = product.stockQuantity + parseInt(req.body.adjustment);
    if (newQuantity < 0) {
      throw new ApiError(400, 'Insufficient stock');
    }

    product.stockQuantity = newQuantity;
    product.stockHistory.push({
      adjustment: parseInt(req.body.adjustment),
      reason: req.body.reason,
      date: Date.now(),
      updatedBy: req.user.id
    });

    await product.save();

    const response = new ResponseHandler(res);
    return response.success(product);
  }),

  getCompatibleProducts: catchAsync(async (req, res) => {
    const { make, model, year } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const query = {
      status: 'active',
      compatibleModels: {
        $elemMatch: {
          make: new RegExp(make, 'i'),
          model: new RegExp(model, 'i')
        }
      }
    };

    if (year) {
      query['compatibleModels.$elemMatch'].year = parseInt(year);
    }

    const products = await VehicleSpecialProduct.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await VehicleSpecialProduct.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      products,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  searchProducts: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchQuery = {
      status: 'active',
      $or: [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { manufacturer: new RegExp(query, 'i') },
        { category: new RegExp(query, 'i') },
        { type: new RegExp(query, 'i') }
      ]
    };

    const products = await VehicleSpecialProduct.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await VehicleSpecialProduct.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      products,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  })
};

module.exports = vehicleSpecialProductController; 