import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, CreditCard, Clock, XCircle, CheckCircle, Car, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId, vehicleName) => {
    if (window.confirm(`Are you sure you wish to cancel your booking for ${vehicleName}? The vehicle will instantly return to available stock.`)) {
      try {
        const res = await api.delete(`/bookings/${bookingId}`);
        if (res.data.success) {
          setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
          alert('Booking successfully cancelled.');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Error cancelling booking.');
      }
    }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">My Reservation History</h1>
          <p className="section-desc">Track and manage your upcoming rentals, payment invoices, and past trips with Royal Rentals.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Loading your booking history...
        </p>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
          <Car size={48} color="#94a3b8" style={{ margin: '0 auto 1.25rem auto' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>No bookings registered yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            You haven't reserved any cars or bikes from our fleet yet. Explore our verified catalog and book your dream ride today!
          </p>
          <Link to="/browse" className="btn btn-primary btn-lg">
            Browse Cars & Bikes <ArrowRight size={18} style={{ marginLeft: '6px' }} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map((booking) => {
            const vehicle = booking.vehicleId || { name: 'Vehicle Removed From Fleet', type: 'N/A', imageUrl: '' };
            const isCancelled = booking.status === 'Cancelled';
            const isCompleted = booking.status === 'Completed';
            const canCancel = !isCancelled && !isCompleted;

            return (
              <div key={booking._id} className="booking-card-mobile" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <img 
                  src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'} 
                  alt={vehicle.name} 
                  style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'; }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>{vehicle.name}</h3>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                    Category: <strong>{vehicle.type}</strong> • Booking Ref ID: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{booking._id.slice(-8).toUpperCase()}</code>
                  </p>

                  <div style={{ display: 'flex', gap: '2rem', fontSize: '0.92rem', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={16} color="#3b82f6" />
                      <span><strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CreditCard size={16} color="#10b981" />
                      <span><strong>Total Invoice:</strong> ₹{booking.totalPrice.toLocaleString('en-IN')} INR ({booking.paymentStatus})</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem', minWidth: '180px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Amount Payed</span>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>₹{booking.totalPrice.toLocaleString('en-IN')}</strong>
                  </div>

                  {canCancel && (
                    <button 
                      onClick={() => handleCancelBooking(booking._id, vehicle.name)} 
                      className="btn btn-danger btn-sm"
                      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      <XCircle size={15} /> Cancel Rental
                    </button>
                  )}
                  {isCancelled && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <XCircle size={14} /> Order Cancelled
                    </span>
                  )}
                  {isCompleted && (
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={15} /> Trip Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
