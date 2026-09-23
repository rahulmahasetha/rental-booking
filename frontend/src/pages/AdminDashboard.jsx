import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Check, X, Car, Calendar, Users, DollarSign,
  RefreshCw, ShieldAlert, KeyRound, Lock, TrendingUp, Sparkles, Bike
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, login } = useAuth();

  // Admin login credentials if visiting /admin while not logged in as Admin
  const [adminEmail, setAdminEmail] = useState('admin@royalrental.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Dashboard navigation and state
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet', 'users', 'bookings'
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vehicle full form modal state
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bike',
    pricePerDay: 1500,
    availability: true,
    description: '',
    imageUrl: '',
    seats: 2,
    transmission: 'Manual',
    fuel: 'Petrol',
  });

  // Quick Price Setter modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceVehicle, setPriceVehicle] = useState(null);
  const [newPrice, setNewPrice] = useState(0);

  const fetchAllAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [vehRes, bookRes, userRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/bookings/all'),
        api.get('/auth/users'),
      ]);

      if (vehRes.data.success) setVehicles(vehRes.data.data);
      if (bookRes.data.success) setBookings(bookRes.data.data);
      if (userRes.data.success) setSystemUsers(userRes.data.data);
    } catch (error) {
      console.error('Admin data synchronization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllAdminData();
    }
  }, [isAdmin]);

  // Admin Portal Login handler (No Create Account option allowed here!)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const result = await login(adminEmail, adminPassword);
    setAuthLoading(false);
    if (!result || !result.success) {
      setAuthError(result?.message || 'Admin authentication failed. Please verify credentials.');
    } else if (result.user?.role !== 'Admin') {
      setAuthError('This account does not have Administrator access privileges.');
    }
  };

  // Summary Analytics computation
  const analytics = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => ['Confirmed', 'Completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const availableVehicles = vehicles.filter((v) => v.availability === true).length;
    const bookedVehicles = vehicles.filter((v) => v.availability === false).length;
    const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;

    return { totalRevenue, availableVehicles, bookedVehicles, pendingBookings };
  }, [vehicles, bookings]);

  // Delete vehicle from inventory
  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you certain you wish to delete this car/bike from Royal Rentals inventory?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        setVehicles(vehicles.filter((v) => v._id !== id));
        alert('Vehicle successfully removed from catalog.');
      } catch (error) {
        alert('Failed to delete vehicle.');
      }
    }
  };

  // Handle Quick Set Price submission
  const handleSavePrice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/vehicles/${priceVehicle._id}`, { pricePerDay: Number(newPrice) });
      if (res.data.success) {
        setVehicles(vehicles.map((v) => (v._id === priceVehicle._id ? res.data.data : v)));
        alert(`✅ Price updated to ₹${Number(newPrice).toLocaleString('en-IN')}/day!`);
        setShowPriceModal(false);
        setPriceVehicle(null);
      }
    } catch (error) {
      alert('Error updating vehicle rental price.');
    }
  };

  // Handle full Add / Edit vehicle submission
  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        const res = await api.put(`/vehicles/${editingVehicle._id}`, formData);
        if (res.data.success) {
          setVehicles(vehicles.map((v) => (v._id === editingVehicle._id ? res.data.data : v)));
          alert('✅ Vehicle specs updated successfully!');
        }
      } else {
        const res = await api.post('/vehicles', formData);
        if (res.data.success) {
          setVehicles([res.data.data, ...vehicles]);
          alert('🎉 Brand new vehicle added to Royal Rentals fleet catalog!');
        }
      }
      setShowVehicleModal(false);
      setEditingVehicle(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving vehicle.');
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      type: 'Bike',
      pricePerDay: 1500,
      availability: true,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      seats: 2,
      transmission: 'Manual',
      fuel: 'Petrol',
    });
    setShowVehicleModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      pricePerDay: vehicle.pricePerDay,
      availability: vehicle.availability,
      description: vehicle.description,
      imageUrl: vehicle.imageUrl || '',
      seats: vehicle.seats || 2,
      transmission: vehicle.transmission || 'Manual',
      fuel: vehicle.fuel || 'Petrol',
    });
    setShowVehicleModal(true);
  };

  const openQuickPriceModal = (vehicle) => {
    setPriceVehicle(vehicle);
    setNewPrice(vehicle.pricePerDay);
    setShowPriceModal(true);
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        setBookings(bookings.map((b) => (b._id === bookingId ? res.data.data : b)));
        // Refresh vehicles to get synced availability
        const vehRes = await api.get('/vehicles');
        if (vehRes.data.success) setVehicles(vehRes.data.data);
        alert(`Reservation marked as ${newStatus}! Vehicle availability synchronized.`);
      }
    } catch (error) {
      alert('Failed to update booking status.');
    }
  };

  // IF NOT LOGGED IN AS ADMIN: Present exclusive Admin Portal authentication screen (No Signup option!)
  if (!isAdmin) {
    return (
      <div className="auth-container" style={{ minHeight: '80vh' }}>
        <div className="auth-card" style={{ maxWidth: '480px', borderTop: '4px solid var(--primary-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '50%', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.1)' }}>
              <Lock size={28} />
            </div>
            <h2 className="auth-title">Royal Rental Admin Console</h2>
            <p className="auth-subtitle">Restricted Administrative Gateway. Please authenticate to access fleet inventory, pricing controls, and user CRM.</p>
          </div>

          {authError && (
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '1.25rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Administrator Email</label>
              <input
                type="email"
                className="form-control"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@royalrental.com"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Admin Security Key</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password (default: admin123)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={authLoading} className="btn btn-primary btn-block btn-lg" style={{ fontWeight: 700 }}>
              <KeyRound size={18} /> {authLoading ? 'Verifying Admin Token...' : 'Authorize Admin Panel Access'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            🔒 Note: Public account creation is disabled for the Administrator portal. Unauthorized connection attempts are logged.
          </div>
        </div>
      </div>
    );
  }

  // IF ADMIN IS AUTHENTICATED: Display full enterprise control suite
  return (
    <div>
      {/* Top Header */}
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} /> LIVE ENTERPRISE MODE
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Admin ID: {user?._id?.slice(-6)?.toUpperCase()}</span>
          </div>
          <h1 className="section-title">Royal Rentals Admin Control Panel</h1>
          <p className="section-desc">Manage your car & bike inventory, set live ₹ INR rental prices, examine customer profiles, and process orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchAllAdminData} disabled={loading} className="btn btn-secondary" title="Sync live database">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Sync
          </button>
          {activeTab === 'fleet' && (
            <button onClick={openAddModal} className="btn btn-primary" style={{ fontWeight: 700 }}>
              <Plus size={18} /> Add Bike / Car
            </button>
          )}
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Earned Revenue</span>
            <div style={{ background: '#ecfdf5', padding: '6px', borderRadius: '8px', color: '#10b981' }}><TrendingUp size={18} /></div>
          </div>
          <h3 style={{ fontSize: '1.75rem', color: 'var(--primary-color)', margin: 0, fontWeight: 800 }}>₹{analytics.totalRevenue.toLocaleString('en-IN')}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From confirmed & completed trips</span>
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Fleet Inventory</span>
            <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb' }}><Car size={18} /></div>
          </div>
          <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>{vehicles.length} Units</h3>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{analytics.availableVehicles} Ready</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / </span>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>{analytics.bookedVehicles} On Trip</span>
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Registered Users</span>
            <div style={{ background: '#f5f3ff', padding: '6px', borderRadius: '8px', color: '#8b5cf6' }}><Users size={18} /></div>
          </div>
          <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>{systemUsers.length} Customers</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified accounts in database</span>
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Approvals</span>
            <div style={{ background: '#fffbeb', padding: '6px', borderRadius: '8px', color: '#d97706' }}><Calendar size={18} /></div>
          </div>
          <h3 style={{ fontSize: '1.75rem', color: analytics.pendingBookings > 0 ? '#d97706' : 'var(--text-primary)', margin: 0, fontWeight: 800 }}>{analytics.pendingBookings} Requests</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requires admin confirmation</span>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          <Car size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Fleet & Pricing ({vehicles.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          User Details CRM ({systemUsers.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Reservations Manager ({bookings.length})
        </button>
      </div>

      {/* Tab 1: Fleet Management & Price Setter */}
      {activeTab === 'fleet' && (
        <>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>Loading inventory...</p>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map((car) => (
                <VehicleCard
                  key={car._id}
                  vehicle={car}
                  isAdmin={true}
                  onEditClick={openEditModal}
                  onDeleteClick={handleDeleteVehicle}
                  onQuickPriceChange={openQuickPriceModal}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: User Details CRM */}
      {activeTab === 'users' && (
        <>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>Loading system accounts...</p>
          ) : systemUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
              <h3>No users found.</h3>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>System Role & Privileges</th>
                    <th>Account Created</th>
                    <th>User ID Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {systemUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                          {u.name}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backgroundColor: u.role === 'Admin' ? '#fef3c7' : '#eff6ff',
                          color: u.role === 'Admin' ? '#b45309' : '#1d4ed8',
                          border: `1px solid ${u.role === 'Admin' ? '#fde68a' : '#bfdbfe'}`
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td><code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{u._id}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab 3: Bookings Management */}
      {activeTab === 'bookings' && (
        <>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>Loading reservations...</p>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
              <h3>No rental reservations booked yet.</h3>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Information</th>
                    <th>Reserved Ride</th>
                    <th>Rental Dates</th>
                    <th>Invoice Total (₹ INR)</th>
                    <th>Status</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const customer = booking.userId || { name: 'Unknown User', email: 'N/A' };
                    const vehicle = booking.vehicleId || { name: 'Vehicle Deleted', type: 'N/A' };
                    const start = new Date(booking.startDate).toLocaleDateString();
                    const end = new Date(booking.endDate).toLocaleDateString();

                    return (
                      <tr key={booking._id}>
                        <td>
                          <strong style={{ display: 'block' }}>{customer.name}</strong>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{customer.email}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {vehicle.type === 'Bike' || vehicle.type === 'Scooter' ? <Bike size={14} /> : <Car size={14} />}
                            {vehicle.name}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{vehicle.type}</span>
                        </td>
                        <td>
                          <span>{start} — {end}</span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>₹{booking.totalPrice?.toLocaleString('en-IN') || 0}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: booking.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                            {booking.paymentStatus?.toUpperCase() || 'UNPAID'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {booking.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, 'Confirmed')}
                                className="btn btn-success btn-sm"
                                title="Confirm order and maintain booked status"
                              >
                                <Check size={14} /> Confirm
                              </button>
                            )}
                            {booking.status === 'Confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, 'Completed')}
                                className="btn btn-primary btn-sm"
                                title="Complete trip and release vehicle back to ready pool"
                              >
                                <Check size={14} /> Complete
                              </button>
                            )}
                            {['Pending', 'Confirmed'].includes(booking.status) && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, 'Cancelled')}
                                className="btn btn-danger btn-sm"
                                title="Cancel order and immediately unlock vehicle availability"
                              >
                                <X size={14} /> Cancel
                              </button>
                            )}
                            {['Completed', 'Cancelled'].includes(booking.status) && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Closed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Quick Price Setter Modal */}
      {showPriceModal && priceVehicle && (
        <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857' }}>
                <TrendingUp size={22} /> Set Rental Price
              </h3>
              <button onClick={() => setShowPriceModal(false)} className="modal-close-btn"><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Modify daily rental rate in Indian Rupees for <strong>{priceVehicle.name}</strong> ({priceVehicle.type}).
            </p>
            <form onSubmit={handleSavePrice}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">New Price per Day (₹ INR)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>₹</span>
                  <input
                    type="number"
                    className="form-control"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    style={{ paddingLeft: '2.2rem', fontSize: '1.2rem', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowPriceModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#059669', borderColor: '#059669', fontWeight: 700 }}>Save ₹ Price</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Vehicle Add / Edit Modal */}
      {showVehicleModal && (
        <div className="modal-overlay" onClick={() => setShowVehicleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '660px' }}>
            <div className="modal-header">
              <h3>{editingVehicle ? 'Edit Vehicle Specifications' : 'Add New Bike / Car to Royal Rental Fleet'}</h3>
              <button onClick={() => setShowVehicleModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSaveVehicle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Model Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Royal Enfield Hunter 350"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Bike">Bike (Motorcycle)</option>
                      <option value="Scooter">Scooter / Moped</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury">Luxury Car</option>
                      <option value="Electric">Electric EV</option>
                      <option value="Sports">Sports Car</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Daily Rental Rate (₹ INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 1500"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Status</label>
                    <select
                      className="form-control"
                      value={formData.availability.toString()}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value === 'true' })}
                    >
                      <option value="true">Available Ready</option>
                      <option value="false">Booked / Garage</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Seats / Wheels Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transmission / Gearbox</label>
                    <select
                      className="form-control"
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    >
                      <option value="Manual">Manual Gear</option>
                      <option value="Automatic">Automatic / CVT / Scooter</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (High-resolution vehicle photo)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description, Engine Specs & Rental Terms</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide details about driving excitement, mileage, helmet inclusion, and comfort..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowVehicleModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '150px', fontWeight: 700 }}>
                    Save to Fleet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
