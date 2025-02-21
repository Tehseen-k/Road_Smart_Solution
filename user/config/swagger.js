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
          url: 'http://localhost:3000',
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
      'D:/flutter_projects/RSS_apis/user/routers/user.route.js',
      'D:/flutter_projects/RSS_apis/user/models/User.js',
      'D:/flutter_projects/RSS_apis/user/routers/userCar.route.js',
      'D:/flutter_projects/RSS_apis/user/models/UserCar.js'
    ]
  };
  

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 