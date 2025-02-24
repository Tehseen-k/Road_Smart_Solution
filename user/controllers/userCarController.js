const UserCar = require('../models/UserCar');
const UserCarDoc = require('../models/UserCarDoc');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const ResponseHandler = require('../../utils/responseHandler');
const validationHelper = require('../../utils/validationHelper');
const paginationHelper = require('../../utils/paginationHelper');
const fileHandler = require('../../utils/fileHandler');

const userCarController = {
  createUserCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const requiredFields = ['carMake', 'carModel', 'fuelType', 'driveType', 'bodyType'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new ApiError(400, `${field} is required`);
      }
    }

    if (req.body.vin) {
      if (typeof req.body.vin !== 'string' || req.body.vin.length !== 17) {
        throw new ApiError(400, 'VIN must be a 17-character string');
      }
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
      if (!vinRegex.test(req.body.vin)) {
        throw new ApiError(400, 'Invalid VIN format');
      }

      const existingCar = await UserCar.findOne({ vin: req.body.vin });
      if (existingCar) {
        throw new ApiError(400, 'VIN already exists');
      }
    }

    if (req.body.registrationNum) {
      if (typeof req.body.registrationNum !== 'string' || req.body.registrationNum.length > 50) {
        throw new ApiError(400, 'Registration number must be a string with a maximum length of 50 characters');
      }
    }

    if (req.body.carYear) {
      const currentYear = new Date().getFullYear();
      if (req.body.carYear < 1900 || req.body.carYear > currentYear) {
        throw new ApiError(400, `Car year must be a number between 1900 and ${currentYear}`);
      }
    }

    const validFuelTypes = ['petrol', 'diesel', 'electric'];
    if (!validFuelTypes.includes(req.body.fuelType)) {
      throw new ApiError(400, `Invalid fuelType. Must be one of: ${validFuelTypes.join(', ')}`);
    }

    const validDriveTypes = ['AWD', 'FWD', 'RWD'];
    if (!validDriveTypes.includes(req.body.driveType)) {
      throw new ApiError(400, `Invalid driveType. Must be one of: ${validDriveTypes.join(', ')}`);
    }

    const validBodyTypes = ['sedan', 'suv', 'hatchback', 'etc'];
    if (!validBodyTypes.includes(req.body.bodyType)) {
      throw new ApiError(400, `Invalid bodyType. Must be one of: ${validBodyTypes.join(', ')}`);
    }

    if (req.body.estimatedValue && req.body.estimatedValue < 0) {
      throw new ApiError(400, 'Estimated value must be a non-negative number');
    }

    const userCar = new UserCar(req.body);
    await userCar.save();

    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        console.log(`file path ${file.path}`)
        const fileUrl = await fileHandler.saveFile(file, 'uploads/car-documents'); // Save file and get URL
        return {
          userCarId: userCar._id,
          docName: file.originalname,
          filePath: fileUrl,
        };
      }));

   await UserCarDoc.insertMany(documents);
      userCar.documents = documents.map(doc => {
        return {
          docName: doc.docName,
          filePath: doc.filePath,
        }
      });
      await userCar.save();
    }

    const populatedCar = await UserCar.findById(userCar._id).populate('documents');
    const response = new ResponseHandler(res);
    return response.created(populatedCar, 'Car created successfully');
  }),

  getUserCars: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);
    const query = validationHelper.sanitizeQuery({ userId, ...req.query });
    delete query.page;
    delete query.limit;

    const cars = await UserCar.find(query).skip(skip).limit(limit).populate('documents');
    const total = await UserCar.countDocuments(query);

    const response = new ResponseHandler(res);
    return response.success({
      cars,
      meta: paginationHelper.getPaginationMetadata(total, page, limit),
    });
  }),

  getCarById: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid car ID');
    }

    const car = await UserCar.findById(req.params.id).populate('documents');
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }

    const response = new ResponseHandler(res);
    return response.success(car);
  }),

  updateCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid car ID');
    }

    const car = await UserCar.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }

    if (req.files && req.files.length > 0) {
      const documents = await Promise.all(req.files.map(async file => {
        if (!fileHandler.isValidFileType(file, ['.pdf', '.jpg', '.jpeg', '.png'])) {
          throw new ApiError(400, 'Invalid file type');
        }
        const fileName = await fileHandler.saveFile(file, 'uploads/car-documents');
        return {
          userCarId: car._id,
          docName: file.originalname,
          filePath: fileName,
        };
      }));

      await UserCarDoc.insertMany(documents);
    }

    const updatedCar = await UserCar.findById(car._id).populate('documents');
    const response = new ResponseHandler(res);
    return response.success(updatedCar, 'Car updated successfully');
  }),

  deleteCar: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.params.id)) {
      throw new ApiError(400, 'Invalid car ID');
    }

    const car = await UserCar.findById(req.params.id);
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }

    const documents = await UserCarDoc.find({ userCarId: car._id });
    await Promise.all(documents.map(doc => fileHandler.deleteFile(doc.filePath)));
    await UserCarDoc.deleteMany({ userCarId: car._id });

    await car.remove();
    const response = new ResponseHandler(res);
    return response.noContent();
  }),

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
      filePath: fileName,
    });

    await document.save();
    const response = new ResponseHandler(res);
    return response.created(document, 'Document added successfully');
  }),

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

  searchCars: catchAsync(async (req, res) => {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');

    const cars = await UserCar.find({
      $or: [
        { carName: searchRegex },
        { carMake: searchRegex },
        { carModel: searchRegex },
        { vin: searchRegex },
        { registrationNum: searchRegex },
      ],
    }).populate('documents');

    const response = new ResponseHandler(res);
    return response.success(cars);
  }),
};

module.exports = userCarController;