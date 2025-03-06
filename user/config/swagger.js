const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Road Smart Solutions API',
        version: '1.0.0',
        description: 'API documentation for Road Smart Solutions',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        }
      },
      servers: [
        {
          url: 'https://roadsmartsolution-production.up.railway.app',
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          Token: {
            type: 'object',
            properties: {
              token: {
                type: 'string',
                description: 'JWT access token'
              },
              type: {
                type: 'string',
                example: 'Bearer'
              }
            }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ],
      paths: {
        '/user/login': {
          post: {
            security: [] // No security for login endpoint
          }
        },
        '/user/register': {
          post: {
            security: [] // No security for register endpoint
          }
        },
        '/user/forgot-password': {
          post: {
            security: [] // No security for forgot password endpoint
          }
        },
        '/user/reset-password/{token}': {
          post: {
            security: [] // No security for reset password endpoint
          }
        },
        '/user/verify-email/{token}': {
          get: {
            security: [] // No security for email verification endpoint
          }
        }
      }
    },
    apis: [
      './user/routers/user.route.js',
      './user/models/User.js',
      './user/routers/userCar.route.js',
      './user/models/UserCar.js',
      './user/routers/carPart.route.js',
      './user/models/CarPart.js',
      './user/routers/carPartOrder.route.js',
      './user/models/CarPartOrder.js',
      './user/routers/serviceCategory.route.js',
      './user/models/ServiceCategory.js',
      './user/routers/serviceProduct.route.js',
      './user/models/ServiceProduct.js',
      './user/routers/carSale.route.js',
      './user/models/CarSale.js',
      './user/routers/carSeller.route.js',
      './user/models/CarSeller.js',
      './user/routers/estimate.route.js',
      './user/models/Estimate.js',
      './user/routers/insurance.route.js',
      './user/models/Insurance.js',
      './user/routers/insuranceClaim.route.js',
      './user/models/InsuranceClaim.js',
      './user/routers/insuranceDetail.route.js',
      './user/models/InsuranceDetail.js',
      './user/routers/insuranceEstimate.route.js',
      './user/models/InsuranceEstimate.js',
      './user/routers/rentalBooking.route.js',
      './user/models/RentalBooking.js',
      './user/routers/rentalCar.route.js',
      './user/models/RentalCar.js',
      './user/routers/rentalProvider.route.js',
      './user/models/RentalProvider.js',
      './user/routers/roadLicense.route.js',
      './user/models/RoadLicense.js',
      './user/routers/serviceProvider.route.js',
      './user/models/ServiceProvider.js',
      './user/routers/serviceRequest.route.js',
      './user/models/ServiceRequest.js',
      './user/routers/carForSale.route.js',
      './user/models/CarForSale.js',
      './user/routers/serviceConfirmation.route.js',
      './user/models/ServiceConfirmation.js',
      './user/routers/serviceQoute.route.js',
      './user/models/ServiceQoute.js',
      './user/routers/serviceReminder.route.js',
      './user/models/ServiceReminder.js',
      './user/routers/serviceType.route.js',
      './user/models/ServiceType.js',
      './user/routers/serviceSubCategory.route.js',
      './user/models/ServiceSubCategory.js',
      './user/routers/vehicleSpecificProduct.route.js',
      './user/models/VehicleSpecificProduct.js',
      
      
    ]
    
  };
  

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 