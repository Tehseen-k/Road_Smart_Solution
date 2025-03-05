const ServiceProduct = require('../models/ServiceProduct');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

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
      brand: req.body.brand,
      createdBy: req.body.userId,
      vehicleSpecificProducts: req.body.vehicleSpecificProducts || []
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
    const { brand } = req.query;

    const query = {};
    if (brand) query.brand = brand;

    const products = await ServiceProduct.find(query)
      .populate('createdBy', 'name email')
      .populate('vehicleSpecificProducts.serviceVehicleId')
      .populate('vehicleSpecificProducts.providerId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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

    const product = await ServiceProduct.findById(id)
      .populate('createdBy', 'name email')
      .populate('vehicleSpecificProducts.serviceVehicleId')
      .populate('vehicleSpecificProducts.providerId');

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

    const updatedProduct = await ServiceProduct.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        brand: req.body.brand,
        vehicleSpecificProducts: req.body.vehicleSpecificProducts
      },
      { new: true, runValidators: true }
    ).populate('createdBy vehicleSpecificProducts.serviceVehicleId vehicleSpecificProducts.providerId');

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

    await ServiceProduct.findByIdAndDelete(id);

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
      $or: [
        { name: new RegExp(query, 'i') },
        { brand: new RegExp(query, 'i') }
      ]
    };

    const products = await ServiceProduct.find(searchQuery)
      .populate('createdBy vehicleSpecificProducts.serviceVehicleId vehicleSpecificProducts.providerId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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