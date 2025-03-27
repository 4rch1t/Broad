require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
const { sequelize } = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const athleteRoutes = require('./routes/athlete.routes');
const performanceRoutes = require('./routes/performance.routes');
const careerRoutes = require('./routes/career.routes');
const injuryRoutes = require('./routes/injury.routes');
const financialRoutes = require('./routes/financial.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/injury', injuryRoutes);
app.use('/api/financial', financialRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  // Check MongoDB connection
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  // Check PostgreSQL connection
  let pgStatus = 'disconnected';
  try {
    await sequelize.authenticate({ timeout: 2000 });
    pgStatus = 'connected';
  } catch (error) {
    logger.error('PostgreSQL health check failed:', error);
  }

  const dbStatus = {
    mongodb: mongoStatus,
    postgresql: pgStatus
  };

  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    databases: dbStatus
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Database connection
const connectDB = async () => {
  try {
    // MongoDB connection
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }

    logger.info('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    logger.info('MongoDB connected successfully');

    // PostgreSQL connection
    logger.info('Connecting to PostgreSQL...');
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    // Don't exit the process immediately, allow the server to start
    // and serve the health endpoint even if DB connection fails
    // process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;