const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./user/config/swagger');

const body_parser = require('body-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./user/routers/index');

const app = express();

connectDB();
app.use(cors());
app.use(body_parser.json({ limit: '30mb' }));
app.use(body_parser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', userRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).json({ status: false, error: `${err.message}` });
});
module.exports = app;