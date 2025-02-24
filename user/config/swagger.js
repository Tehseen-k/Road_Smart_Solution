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
      './user/models/CarPartOrder.js'
    ]
    
  };
  

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 