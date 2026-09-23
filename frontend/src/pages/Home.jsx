import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import { Shield, Clock, Award, Sparkles, ArrowRight, Car, Bike, CheckCircle, Zap, Star } from 'lucide-react';

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBookingVehicle, setActiveBookingVehicle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles?available=true');
        if (res.data.success) {
          setVehicles(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load home vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const categories = ['All', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Bike', 'Scooter', 'Sports'];

  const filteredVehicles = selectedCategory === 'All'
    ? vehicles.slice(0, 6)
    : vehicles.filter(v => v.type === selectedCategory).slice(0, 6);

  const handleBookingSuccess = (newBooking) => {
    alert(`🎉 Success! Your reservation has been submitted. Booking ID: ${newBooking._id}`);
    navigate('/my-bookings');
  };

  return (
    <div>
      {/* 2-Column Luxury Hero Showcase Section */}
      <section className="hero-section">
        <div className="hero-grid">
          {/* Left Column: Typography & Actions */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.45rem 1rem', borderRadius: '9999px', color: '#1e40af', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(37,99,235,0.05)' }}>
              <Sparkles size={16} color="#2563eb" /> #1 Rated Car & Bike Rental in India
            </div>

            <h1 className="hero-title" style={{ fontSize: '3.3rem', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Experience Pure <span>Driving</span> & <span>Riding</span> Freedom.
            </h1>

            <p className="hero-subtitle" style={{ fontSize: '1.12rem', lineHeight: 1.6, marginBottom: '2.2rem' }}>
              From legendary Royal Enfield & KTM motorbikes to executive BMW sedans and adventure Mahindra Thars. Reserve your dream ride in seconds with guaranteed lowest <strong>₹ INR</strong> rates and zero hidden fees.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/browse" className="btn btn-primary btn-lg" style={{ padding: '0.85rem 1.8rem', fontSize: '1.02rem' }}>
                Explore Cars & Bikes <ArrowRight size={19} style={{ marginLeft: '6px' }} />
              </Link>
              <Link to="/browse?category=Bike" className="btn btn-secondary btn-lg" style={{ padding: '0.85rem 1.6rem', fontSize: '1.02rem', background: 'white' }}>
                <Bike size={19} style={{ marginRight: '8px', color: 'var(--primary-color)' }} /> Rent Motorcycles
              </Link>
            </div>

            {/* Bottom Hero Stats Bar */}
            <div className="hero-stats">
              <div className="stat-item">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>500+</h4>
                <p>Trips Completed</p>
              </div>
              <div className="stat-item">
                <h4>50+</h4>
                <p>Verified Cars & Bikes</p>
              </div>
              <div className="stat-item">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>4.9 <Star size={20} fill="#f59e0b" color="#f59e0b" /></h4>
                <p>Customer Reviews</p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Visual Showcase */}
          <div className="hero-image-wrapper" style={{ padding: '1rem 0' }}>
            {/* Floating Badge Top Right */}
            <div className="hero-floating-badge" style={{ top: '10px', right: '-10px' }}>
              <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '10px', color: '#10b981', display: 'flex' }}>
                <Bike size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>Royal Enfield & KTM</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>From ₹800/day</span>
              </div>
            </div>

            {/* Floating Badge Bottom Left */}
            <div className="hero-floating-badge" style={{ bottom: '20px', left: '-10px', animationDelay: '1.5s' }}>
              <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px', color: '#2563eb', display: 'flex' }}>
                <Zap size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>Instant UPI Checkout</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Zero deposit required</span>
              </div>
            </div>

            {/* Main Showcase Composite Image */}
            <img
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85"
              alt="Luxury Automobile & Bike Showcase"
              className="hero-car-img"
              style={{ maxHeight: '420px', objectFit: 'cover', width: '100%', borderRadius: '24px', border: '4px solid white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            />
          </div>
        </div>
      </section>

      {/* Featured Fleet Preview */}
      <section style={{ margin: '4rem 0' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Fleet & Bikes</h2>
            <p className="section-desc">Hand-picked popular luxury automobiles and sport motorcycles ready for immediate booking.</p>
          </div>
          <Link to="/browse" className="btn btn-secondary">
            View Complete Catalog ({vehicles.length}) <ArrowRight size={16} style={{ marginLeft: '4px' }} />
          </Link>
        </div>

        {/* Category Filters */}
        <div className="filters-bar">
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'Bike' || cat === 'Scooter' ? <Bike size={14} style={{ marginRight: '4px' }} /> : null}
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.2rem' }}>Loading premium vehicles from database...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No vehicles found in category "{selectedCategory}". Try selecting another tab!</p>
          </div>
        ) : (
          <div className="vehicles-grid">
            {filteredVehicles.map((car) => (
              <VehicleCard
                key={car._id}
                vehicle={car}
                onBookClick={(v) => setActiveBookingVehicle(v)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Call to Action Banner */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', padding: '3.5rem 3rem', borderRadius: '24px', textAlign: 'center', marginBottom: '4rem', boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.25)' }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
          Planning a Weekend Ride or Mountain Trip?
        </h2>
        <p style={{ fontSize: '1.15rem', color: '#bfdbfe', maxWidth: '680px', margin: '0 auto 2.5rem auto' }}>
          Explore our complete lineup of Royal Enfield motorcycles and high-performance SUVs with unlimited kilometers packages at unbeatable ₹ INR rates!
        </p>
        <Link to="/browse" className="btn btn-lg" style={{ backgroundColor: 'white', color: '#1e3a8a', fontWeight: 800, padding: '1rem 2.8rem', fontSize: '1.05rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15)' }}>
          Reserve Your Ride Now
        </Link>
      </section>

      {/* Booking Checkout Modal */}
      {activeBookingVehicle && (
        <BookingModal
          vehicle={activeBookingVehicle}
          onClose={() => setActiveBookingVehicle(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Home;
