const express = require('express');
const Booking = require('../../models/Booking');
const Vehicle = require('../../models/Vehicle');
const { protect } = require('../../middleware/auth');
const { authorizeAdmin } = require('../../middleware/role');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new car reservation (Customer online booking)
// @access  Private (Requires Login)
router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, paymentStatus, paymentReference } = req.body;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Vehicle, start date, and end date are required.' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    if (!vehicle.availability) {
      return res.status(400).json({ success: false, message: 'This vehicle is currently unavailable for rental.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (days <= 0 || isNaN(days)) {
      return res.status(400).json({ success: false, message: 'End date must be at least 1 day after start date.' });
    }

    // Check for conflicting active bookings for this specific vehicle
    const conflictingBookings = await Booking.find({
      vehicleId,
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ success: false, message: 'Vehicle is already booked for the selected date range.' });
    }

    const totalPrice = days * vehicle.pricePerDay;

    const booking = await Booking.create({
      userId: req.user._id,
      vehicleId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'Pending',
      paymentStatus: paymentStatus || 'Unpaid',
      paymentReference: paymentReference || ''
    });

    // Mark vehicle as booked/unavailable in real-time
    vehicle.availability = false;
    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully!',
      data: booking,
      days,
      unitPrice: vehicle.pricePerDay
    });
  } catch (error) {
    console.error('[Booking Service] Create Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error processing booking.' });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current logged-in user's booking history and statuses
// @access  Private
router.get(['/my', '/my-bookings'], protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('vehicleId', 'name type pricePerDay imageUrl transmission fuel seats')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve booking records.' });
  }
});

// @route   GET /api/bookings/all
// @desc    Get all system reservations (Admin Only)
// @access  Private / Admin
router.get('/all', protect, authorizeAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email role')
      .populate('vehicleId', 'name type imageUrl pricePerDay')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve system rental records.' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Confirm / Complete / Cancel) and manage vehicle availability (Admin Only)
// @access  Private / Admin
router.put('/:id/status', protect, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status provided.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found.' });
    }

    booking.status = status;
    await booking.save();

    // If booking is completed or cancelled, return vehicle to available pool
    if (['Cancelled', 'Completed'].includes(status)) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { availability: true });
    } else if (['Pending', 'Confirmed'].includes(status)) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { availability: false });
    }

    res.json({ success: true, message: `Booking status updated to ${status}. Vehicle availability synchronized.`, data: booking });
  } catch (error) {
    console.error('[Booking Service] Status Update Error:', error);
    res.status(500).json({ success: false, message: 'Error updating reservation status.' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking (by customer or admin) and release vehicle availability back to true
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found on server.' });
    }

    // Check ownership or admin status
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking.' });
    }

    // Mark as cancelled
    booking.status = 'Cancelled';
    await booking.save();

    // Release vehicle back into available rental pool
    if (booking.vehicleId) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { availability: true });
    }

    res.json({ success: true, message: 'Booking cancelled successfully! The vehicle is now back in available stock.', data: booking });
  } catch (error) {
    console.error('[Booking Service] Cancel Delete Error:', error);
    res.status(500).json({ success: false, message: 'Error processing booking cancellation.' });
  }
});

module.exports = router;
