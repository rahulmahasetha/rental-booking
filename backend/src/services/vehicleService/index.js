const express = require('express');
const Vehicle = require('../../models/Vehicle');
const { protect } = require('../../middleware/auth');
const { authorizeAdmin } = require('../../middleware/role');

const router = express.Router();

// @route   GET /api/vehicles
// @desc    Get all vehicles with optional filters (type, availability, search text)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, availability, search, minPrice, maxPrice } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.type = type;
    }
    if (availability !== undefined && availability !== '') {
      query.availability = availability === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    console.error('[Vehicle Service] Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve vehicles.' });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get a single vehicle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found in catalog.' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vehicle details.' });
  }
});

// @route   POST /api/vehicles
// @desc    Add a brand new vehicle to the fleet (Admin Only)
// @access  Private / Admin
router.post('/', protect, authorizeAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, message: 'Vehicle added successfully!', data: vehicle });
  } catch (error) {
    console.error('[Vehicle Service] Create Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Could not add vehicle.' });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle properties or availability (Admin Only)
// @access  Private / Admin
router.put('/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    res.json({ success: true, message: 'Vehicle updated successfully!', data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating vehicle specifications.' });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Remove a vehicle from the fleet (Admin Only)
// @access  Private / Admin
router.delete('/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    res.json({ success: true, message: 'Vehicle removed from fleet catalog.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting vehicle.' });
  }
});

module.exports = router;
