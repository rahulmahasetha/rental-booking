import React from 'react';
import { Users, Gauge, Zap, Calendar, Bike, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VehicleCard = ({ vehicle, onBookClick, onEditClick, isAdmin, onDeleteClick, onQuickPriceChange }) => {
  const { isAdmin: isLoggedAdmin } = useAuth();
  const navigate = useNavigate();
  const isAvailable = vehicle.availability;
  const isTwoWheeler = vehicle.type === 'Bike' || vehicle.type === 'Scooter';

  return (
    <div className="vehicle-card">
      <div className="card-img-wrapper">
        <img 
          src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'} 
          alt={vehicle.name}
          className="card-img" 
          onError={(e) => {
            e.target.src = isTwoWheeler
              ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <span className={`card-badge ${isAvailable ? 'badge-available' : 'badge-booked'}`}>
          {isAvailable ? 'Available Now' : 'Currently Booked'}
        </span>
        <span className="card-category" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isTwoWheeler && <Bike size={13} />}
          {vehicle.type}
        </span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{vehicle.name}</h3>
        <p className="card-desc">{vehicle.description}</p>

        <div className="card-specs">
          <div className="spec-item" title="Capacity">
            <Users size={16} color="#3b82f6" />
            <span>{vehicle.seats || (isTwoWheeler ? 2 : 5)} Seats</span>
          </div>
          <div className="spec-item" title="Transmission Type">
            <Gauge size={16} color="#6366f1" />
            <span>{vehicle.transmission || 'Automatic'}</span>
          </div>
          <div className="spec-item" title="Fuel / Power">
            <Zap size={16} color="#10b981" />
            <span>{vehicle.fuel || 'Petrol'}</span>
          </div>
        </div>

        <div className="card-footer">
          <div className="price-tag">
            <span className="price-amount">₹{vehicle.pricePerDay.toLocaleString('en-IN')}</span>
            <span className="price-period">/ day</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isAdmin && (
              <>
                {onQuickPriceChange && (
                  <button 
                    onClick={() => onQuickPriceChange(vehicle)} 
                    className="btn btn-secondary btn-sm"
                    title="Quick change daily rent price in ₹"
                    style={{ padding: '0.4rem 0.65rem', color: '#047857', fontWeight: 700 }}
                  >
                    Set Price
                  </button>
                )}
                <button 
                  onClick={() => onEditClick(vehicle)} 
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDeleteClick(vehicle._id)} 
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </>
            )}
            
            {!isAdmin && isLoggedAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="btn btn-secondary btn-sm"
                style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: 700 }}
              >
                <ShieldCheck size={16} color="#2563eb" style={{ marginRight: '4px' }} />
                Manage in Admin Panel
              </button>
            )}

            {!isAdmin && !isLoggedAdmin && (
              <button
                onClick={() => onBookClick(vehicle)}
                disabled={!isAvailable}
                className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
                style={{ cursor: !isAvailable ? 'not-allowed' : 'pointer', opacity: !isAvailable ? 0.7 : 1 }}
              >
                <Calendar size={15} />
                {isAvailable ? 'Book Rental' : 'Unavailable'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
