import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const result = await login(email, password);
    setLoading(false);
    if (result && result.success) {
      if (result.user && result.user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErr(result.message || 'Login verification failed.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome to Faizan Rentals</h2>
        <p className="auth-subtitle">Log in to reserve premium bikes & cars or access your dashboard.</p>

        {err && (
          <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '1.25rem', border: '1px solid #fecaca' }}>
            {err}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your secret password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            <LogIn size={18} /> {loading ? 'Verifying...' : 'Log In to System'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet? <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Create an Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
