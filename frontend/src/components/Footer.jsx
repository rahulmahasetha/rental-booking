import React from 'react';
import { Car, Shield, Award, Headphones } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.2rem' }}>
          <div className="logo-icon" style={{ width: '28px', height: '28px', background: '#2563eb', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={16} />
          </div>
          <span>Royal Rentals</span>
        </div>

        <div style={{ display: 'flex', gap: '2.5rem', color: '#475569', fontSize: '0.88rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={16} color="#10b981" /> 100% Insured Cars & Bikes</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Award size={16} color="#2563eb" /> Verified Premium Models</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Headphones size={16} color="#6366f1" /> 24/7 Roadside Support</span>
        </div>

        <div className="footer-text">
          &copy; {new Date().getFullYear()} Royal Rental Car & Bike Rental System. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
