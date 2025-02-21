const UserCar = require('../models/UserCar');
const UserCarDoc = require('../models/UserCarDoc');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const userCarController = {
  // Create new user car
  createUserCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const userCar = new UserCar(req.body);
    await userCar.save();

    // Handle document uploads
    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        const fileName = await fileHandler.saveFile(file, 'uploads/car-documents');
        return {
          userCarId: userCar._id,
          docName: file.originalname,
          filePath: fileName
        };
      }));

      await UserCarDoc.insertMany(documents);
    }

    const populatedCar = await UserCar.findById(userCar._id)
      .populate('documents');

    const response = new ResponseHandler(res);
    return response.created(populatedCar, 'Car created successfully');
  }),

  // Get all cars for a user
  getUserCars: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery({ userId, ...req.query });
    delete query.page;
    delete query.limit;

    const cars = await UserCar.find(query)
      .skip(skip)
      .limit(limit)
      .populate('documents');

    const total = await UserCar.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      cars,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  // Get car by ID
  getCarById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid car ID');
    }

    const car = await UserCar.findById(req.params.id)
      .populate('documents');

    if (!car) {
      throw new ApiError(404, 'Car not found');
    }

    const response = new ResponseHandler(res);
    return response.success(car);
  }),

  // Update car
  updateCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid car ID');
    }

    const car = await UserCar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!car) {
      throw new ApiError(404, 'Car not found');
    }

    // Handle document updates
    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        const fileName = await fileHandler.saveFile(file, 'uploads/car-documents');
        return {
          userCarId: car._id,
          docName: file.originalname,
          filePath: fileName
        };
      }));

      await UserCarDoc.insertMany(documents);
    }

    const updatedCar = await UserCar.findById(car._id)
      .populate('documents');

    const response = new ResponseHandler(res);
    return response.success(updatedCar, 'Car updated successfully');
  }),

  // Delete car
  deleteCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid car ID');
    }

    const car = await UserCar.findById(req.params.id);
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }

    // Delete associated documents
    const documents = await UserCarDoc.find({ userCarId: car._id });
    await Promise.all(documents.map(doc => 
      fileHandler.deleteFile(doc.filePath)
    ));
    await UserCarDoc.deleteMany({ userCarId: car._id });

    await car.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Add car document
  addCarDocument: catchAsync(async (req, res) => {
    const { carId } = req.params;
    if (!validationHelper.isValidId(carId)) {
      throw new ApiError(400, 'Invalid car ID');
    }

    const car = await UserCar.findById(carId);
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }

    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    if (!fileHandler.isValidFileType(req.file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
      throw new ApiError(400, 'Invalid file type');
    }

    const fileName = await fileHandler.saveFile(req.file, 'uploads/car-documents');
    const document = new UserCarDoc({
      userCarId: carId,
      docName: req.file.originalname,
      filePath: fileName
    });

    await document.save();

    const response = new ResponseHandler(res);
    return response.created(document, 'Document added successfully');
  }),

  // Delete car document
  deleteCarDocument: catchAsync(async (req, res) => {
    const { docId } = req.params;
    if (!validationHelper.isValidId(docId)) {
      throw new ApiError(400, 'Invalid document ID');
    }

    const document = await UserCarDoc.findById(docId);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }

    await fileHandler.deleteFile(document.filePath);
    await document.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  // Search cars
  searchCars: catchAsync(async (req, res) => {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');

    const cars = await UserCar.find({
      $or: [
        { carName: searchRegex },
        { carMake: searchRegex },
        { carModel: searchRegex },
        { vin: searchRegex },
        { registrationNum: searchRegex }
      ]
    }).populate('documents');

    const response = new ResponseHandler(res);
    return response.success(cars);
  })
};

module.exports = userCarController; 