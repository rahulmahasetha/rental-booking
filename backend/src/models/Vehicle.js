const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide vehicle name'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Please provide vehicle category type'],
    enum: ['Sedan', 'SUV', 'Luxury', 'Electric', 'Sports', 'Convertible', 'Bike', 'Scooter'],
    default: 'Sedan',
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: 0,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide vehicle description'],
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  },
  seats: {
    type: Number,
    default: 5,
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual'],
    default: 'Automatic',
  },
  fuel: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    default: 'Petrol',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
