import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('car_rental_token');
      const savedUser = localStorage.getItem('car_rental_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('car_rental_user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          console.error('Failed to verify existing session token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('car_rental_token', token);
        localStorage.setItem('car_rental_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed due to server error.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (name, email, password, role = 'Customer') => {
    try {
      setError(null);
      const response = await api.post('/auth/register', { name, email, password, role });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('car_rental_token', token);
        localStorage.setItem('car_rental_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('car_rental_token');
    localStorage.removeItem('car_rental_user');
    setUser(null);
  };

  const isAdmin = user && user.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
