const mongoose = require('mongoose');
const seedIfEmpty = require('../seed/autoSeed');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car_rental_booking');
    console.log(`[Database Layer] MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    
    // Check if seeding is needed for smooth zero-config demo experience
    await seedIfEmpty();
  } catch (error) {
    console.error(`[Database Layer] MongoDB Connection Error: ${error.message}`);
    console.warn(`[Database Layer] Please ensure your local MongoDB daemon (mongod) is actively running!`);
    // Do not crash immediately so helpful error logs stay visible in terminal
  }
};

module.exports = connectDB;
