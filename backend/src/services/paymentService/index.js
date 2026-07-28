const express = require('express');
const { protect } = require('../../middleware/auth');
const Booking = require('../../models/Booking');

const router = express.Router();

// @route   POST /api/payments/process
// @desc    Simulate online payment processing (Optional Payment Service in PDF architecture)
// @access  Private
router.post('/process', protect, async (req, res) => {
  try {
    const { amount, vehicleName, cardNumber, bookingId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transaction amount.' });
    }

    // Simulate payment authorization delay and generate transaction reference
    const timestamp = Date.now();
    const transactionId = `TXN_CAR_RENTAL_${timestamp}_${Math.floor(Math.random() * 100000)}`;

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'Paid',
        paymentReference: transactionId
      });
    }

    res.json({
      success: true,
      message: `Payment of $${amount} for ${vehicleName || 'rental reservation'} processed successfully!`,
      transactionId,
      timestamp,
      receiptUrl: `/receipts/${transactionId}`
    });
  } catch (error) {
    console.error('[Payment Service Error]:', error);
    res.status(500).json({ success: false, message: 'Payment gateway simulation failed.' });
  }
});

module.exports = router;
