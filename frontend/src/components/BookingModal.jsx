import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BookingModal = ({ vehicle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Default to tomorrow for start and 3 days later for end
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysAfter = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(threeDaysAfter);
  const [days, setDays] = useState(2);
  const [totalPrice, setTotalPrice] = useState(0);
  const [includeMockPayment, setIncludeMockPayment] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (calculatedDays > 0 && !isNaN(calculatedDays)) {
        setDays(calculatedDays);
        setTotalPrice(calculatedDays * vehicle.pricePerDay);
        setError(null);
      } else {
        setDays(0);
        setTotalPrice(0);
        setError('End date must be at least 1 day after the start date.');
      }
    }
  }, [startDate, endDate, vehicle.pricePerDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (days <= 0) {
      setError('Please select a valid rental date range.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let paymentReference = '';
      let paymentStatus = 'Unpaid';

      // Execute Mock Payment Service if enabled by customer
      if (includeMockPayment) {
        try {
          const payRes = await api.post('/payments/process', {
            amount: totalPrice,
            vehicleName: vehicle.name,
            cardNumber: '6024-XXXX-XXXX-8921',
          });
          if (payRes.data.success) {
            paymentStatus = 'Paid';
            paymentReference = payRes.data.transactionId;
          }
        } catch (payErr) {
          console.warn('Mock payment simulated error:', payErr);
        }
      }

      const res = await api.post('/bookings', {
        vehicleId: vehicle._id,
        startDate,
        endDate,
        paymentStatus,
        paymentReference,
      });

      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking reservation.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Login Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please log in or create an account to reserve the <strong>{vehicle.name}</strong> at Faizan Rentals.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button onClick={() => navigate('/login')} className="btn btn-primary">Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.4rem' }}>Reserve {vehicle.name}</h3>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              ₹{vehicle.pricePerDay.toLocaleString('en-IN')} / day • {vehicle.type}
            </span>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '1.25rem', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rental Start Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  min={today}
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Return End Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  min={startDate || today}
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="price-calculator-box">
              <div className="calc-row">
                <span>Daily Rental Rate</span>
                <strong>₹{vehicle.pricePerDay.toLocaleString('en-IN')} INR</strong>
              </div>
              <div className="calc-row">
                <span>Rental Duration</span>
                <strong>{days > 0 ? `${days} Days` : 'Invalid Range'}</strong>
              </div>
              <div className="calc-row">
                <span>Comprehensive Roadside Insurance & Helmet/Gear Protection</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
              </div>
              <div className="calc-total">
                <span>Estimated Total Price</span>
                <span>₹{totalPrice.toLocaleString('en-IN')} INR</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#1e3a8a', fontSize: '0.95rem' }}>
                  <CreditCard size={18} color="#2563eb" /> Complete Instant Checkout (Online UPI/Card)
                </span>
                <input 
                  type="checkbox" 
                  checked={includeMockPayment} 
                  onChange={(e) => setIncludeMockPayment(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#3b82f6', margin: 0 }}>
                {includeMockPayment 
                  ? 'Simulates instant online checkout (UPI / Card Gateway) to confirm your rental invoice immediately as Paid.' 
                  : 'Booking will be submitted with Unpaid status for physical payment upon showroom pickup.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || days <= 0} 
                className="btn btn-primary"
                style={{ minWidth: '160px' }}
              >
                {loading ? 'Processing...' : `Confirm & Book (${totalPrice > 0 ? '₹' + totalPrice.toLocaleString('en-IN') : ''})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
