const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { vehiclesData } = require('./autoSeed');

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car_rental_booking');
    console.log('[Seed CLI] Connected to MongoDB.');

    await Vehicle.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    console.log('[Seed CLI] Cleared existing Users, Vehicles, and Bookings.');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const customerPassword = await bcrypt.hash('customer123', salt);

    await User.create({
      name: 'Royal Rental Admin',
      email: 'admin@royalrental.com',
      password: adminPassword,
      role: 'Admin'
    });

    await User.create({
      name: 'Rahul Customer',
      email: 'customer@royalrental.com',
      password: customerPassword,
      role: 'Customer'
    });
    console.log('[Seed CLI] Demo users created: admin@royalrental.com & customer@royalrental.com');

    await Vehicle.insertMany(vehiclesData);
    console.log(`[Seed CLI] Successfully inserted ${vehiclesData.length} vehicles (Cars & Bikes in ₹ INR).`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed CLI Error]:', error);
    process.exit(1);
  }
};

runSeed();
