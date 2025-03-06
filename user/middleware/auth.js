const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/ApiError');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Invalid token format');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "d2e4a9f1b8c3e6d5a7b2c9f0e3d6a8b1c4f7e2d5a8b9c6e3f0a7d4b1e8c5f2a9d6b3e0c7f4a1b8e5c2d9f6a3b0c7e4d1f8a5b2c9e6d3f0a7b4c1e8d5f2");
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token has expired');
      }
      throw new ApiError(401, 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware; 