require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('../config/db');

// Microservices-Inspired Domain Services imported into API Gateway
const authService = require('../services/authService');
const vehicleService = require('../services/vehicleService');
const bookingService = require('../services/bookingService');
const paymentService = require('../services/paymentService');

const app = express();
const PORT = process.env.PORT || 5005;

// Initialize Mongoose Database & Auto-Seed check
connectDB();

// Middleware Layer
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Gateway Routing Entry Points
console.log('--- [API Gateway] Registering backend service routes ---');
app.use('/api/auth', authService);
app.use('/api/vehicles', vehicleService);
app.use('/api/bookings', bookingService);
app.use('/api/payments', paymentService);

// Gateway Root Status Test
app.get('/api/status', (req, res) => {
  res.json({
    system: 'Car Rental Booking System API Gateway',
    status: 'Online',
    version: '1.0.0',
    services: ['Authentication Service', 'Vehicle Service', 'Booking Service', 'Payment Service (Optional)'],
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handling Middleware
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `API Gateway endpoint ${req.originalUrl} not found on server.` });
});

app.use((err, req, res, next) => {
  console.error('[Gateway Exception]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error occurred within Backend Service.',
  });
});

// Launch API Gateway Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`==================================================================`);
    console.log(`🚀 [API Gateway] Server running synchronously on Port ${PORT}`);
    console.log(`🌐 [Gateway Entry] Status endpoint: http://localhost:${PORT}/api/status`);
    console.log(`==================================================================`);
  });
}

module.exports = app;
