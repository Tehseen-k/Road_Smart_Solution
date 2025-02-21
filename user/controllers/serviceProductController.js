const ServiceProduct = require('../models/ServiceProduct');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const serviceProductController = {
  createProduct: catchAsync(async (req, res) => {
    const existingProduct = await ServiceProduct.findOne({
      name: req.body.name,
      brand: req.body.brand
    });

    if (existingProduct) {
      throw new ApiError(400, 'Product with this name and brand already exists');
    }

    const product = new ServiceProduct({
      name: req.body.name,
      description: req.body.description,
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      unit: req.body.unit,
      stockQuantity: req.body.stockQuantity,
      minStockLevel: req.body.minStockLevel,
      specifications: req.body.specifications || {},
      usage: req.body.usage || [],
      safetyInfo: req.body.safetyInfo || [],
      warrantyInfo: req.body.warrantyInfo,
      status: 'active'
    });

    if (req.files && req.files.length > 0) {
      const images = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/product-images')
      ));
      product.images = images;
    }

    await product.save();

    const response = new ResponseHandler(res);
    return response.created(product);
  }),

  getAllProducts: catchAsync(async (req, res) => {
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const { category, brand, inStock, status, sortBy } = req.query;

    const query = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (status) query.status = status;
    if (inStock === 'true') query.stockQuantity = { $gt: 0 };

    let sort = { createdAt: -1 };
    if (sortBy === 'price') sort = { price: 1 };
    if (sortBy === 'name') sort = { name: 1 };
    if (sortBy === 'stock') sort = { stockQuantity: -1 };

    const products = await ServiceProduct.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await ServiceProduct.countDocuments(query);

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

    const product = await ServiceProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const response = new ResponseHandler(res);
    return response.success(product);
  }),

  updateProduct: catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid product ID');
    }

    const product = await ServiceProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(req.files.map(file => 
        fileHandler.saveFile(file, 'uploads/product-images')
      ));
      req.body.images = [...(product.images || []), ...newImages];
    }

    const updatedProduct = await ServiceProduct.findByIdAndUpdate(
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

    const product = await ServiceProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
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

    const product = await ServiceProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
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

  searchProducts: catchAsync(async (req, res) => {
    const { query } = req.query;
    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const searchQuery = {
      status: 'active',
      $or: [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { brand: new RegExp(query, 'i') },
        { category: new RegExp(query, 'i') }
      ]
    };

    const products = await ServiceProduct.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await ServiceProduct.countDocuments(searchQuery);

    const response = new ResponseHandler(res);
    return response.success({
      products,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getLowStockProducts: catchAsync(async (req, res) => {
    const products = await ServiceProduct.find({
      status: 'active',
      $expr: {
        $lte: ['$stockQuantity', '$minStockLevel']
      }
    }).sort({ stockQuantity: 1 });

    const response = new ResponseHandler(res);
    return response.success(products);
  }),

  removeProductImage: catchAsync(async (req, res) => {
    const { id, imageIndex } = req.params;
    if (!validationHelper.isValidId(id)) {
      throw new ApiError(400, 'Invalid product ID');
    }

    const product = await ServiceProduct.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (!product.images || !product.images[imageIndex]) {
      throw new ApiError(404, 'Image not found');
    }

    await fileHandler.deleteFile(product.images[imageIndex]);
    product.images.splice(imageIndex, 1);
    await product.save();

    const response = new ResponseHandler(res);
    return response.success(product);
  })
};

module.exports = serviceProductController; 