import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import { Search, SlidersHorizontal, ArrowUpDown, Filter, Bike, Car } from 'lucide-react';

const BrowseVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // URL params support
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialCat = queryParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [availabilityFilter, setAvailabilityFilter] = useState('All'); // All, Available, Booked
  const [sortBy, setSortBy] = useState('price-asc'); // price-asc, price-desc, name
  const [activeBookingVehicle, setActiveBookingVehicle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (queryParams.get('category')) {
      setSelectedCategory(queryParams.get('category'));
    }
  }, [queryParams]);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await api.get('/vehicles');
        if (res.data.success) {
          setVehicles(res.data.data);
        }
      } catch (error) {
        console.error('Error loading fleet catalog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const categories = ['All', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Bike', 'Scooter', 'Sports'];

  // Filter & sort logic
  const filteredAndSortedVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || v.type === selectedCategory;
      
      const matchesAvailability = availabilityFilter === 'All' ||
                                  (availabilityFilter === 'Available' && v.availability === true) ||
                                  (availabilityFilter === 'Booked' && v.availability === false);

      return matchesSearch && matchesCategory && matchesAvailability;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [vehicles, searchQuery, selectedCategory, availabilityFilter, sortBy]);

  const handleBookingSuccess = (newBooking) => {
    alert(`🎉 Success! Your vehicle has been reserved! Order # ${newBooking._id}`);
    navigate('/my-bookings');
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title">Faizan Car & Bike Fleet Catalog</h1>
          <p className="section-desc">Browse our complete lineup of premium cars, luxury SUVs, and thrilling motorbikes available across town.</p>
        </div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing <strong>{filteredAndSortedVehicles.length}</strong> available options
        </div>
      </div>

      {/* Advanced Control Panel */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        
        {/* Row 1: Search & Sort & Availability */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by model, brand (e.g., Royal Enfield, KTM, Thar, BMW)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.6rem', height: '44px' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={16} color="var(--text-secondary)" />
              <select 
                className="form-control" 
                value={availabilityFilter} 
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                style={{ height: '44px' }}
              >
                <option value="All">Status: All Vehicles</option>
                <option value="Available">Status: Available Now</option>
                <option value="Booked">Status: Booked / In Trip</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={16} color="var(--text-secondary)" />
              <select 
                className="form-control" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: '44px' }}
              >
                <option value="price-asc">Price: Lowest to Highest ₹</option>
                <option value="price-desc">Price: Highest to Lowest ₹</option>
                <option value="name">Model Name: A — Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Category Chip Filter */}
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
            <Filter size={15} /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'Bike' || cat === 'Scooter' ? <Bike size={14} style={{ marginRight: '4px' }} /> : <Car size={14} style={{ marginRight: '4px', opacity: 0.7 }} />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid Display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem' }}>Loading Faizan vehicle inventory...</p>
        </div>
      ) : filteredAndSortedVehicles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No matching cars or bikes found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>We couldn't find any vehicles matching your current filters or search text.</p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setAvailabilityFilter('All'); }} 
            className="btn btn-primary"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="vehicles-grid">
          {filteredAndSortedVehicles.map((car) => (
            <VehicleCard
              key={car._id}
              vehicle={car}
              onBookClick={(v) => setActiveBookingVehicle(v)}
            />
          ))}
        </div>
      )}

      {/* Booking Modal Trigger */}
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

export default BrowseVehicles;
