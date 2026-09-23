import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, User, LogOut, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          <div className="logo-icon">
            <Car size={22} />
          </div>
          <span>Royal Rentals</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/')}>Home</Link>
          </li>
          <li>
            <Link to="/browse" className={isActive('/browse')}>Cars & Bikes</Link>
          </li>
          {user && !isAdmin && (
            <li>
              <Link to="/my-bookings" className={isActive('/my-bookings')}>My Bookings</Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="user-pill">
                <User size={15} color="#2563eb" />
                <span>{user.name}</span>
                <span className={`role-tag ${isAdmin ? 'admin' : 'customer'}`}>
                  {isAdmin ? 'Admin' : 'Customer'}
                </span>
              </div>
              <button 
                onClick={logout} 
                className="btn btn-secondary btn-sm" 
                title="Logout from system"
                style={{ padding: '0.45rem 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
