const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

const vehiclesData = [
  {
    name: 'Royal Enfield Hunter 350',
    type: 'Bike',
    pricePerDay: 1200,
    availability: true,
    description: 'Iconic modern-retro Roadster boasting rich torque, comfortable ergonomics, and an effortless city ride.',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80',
    seats: 2,
    transmission: 'Manual',
    fuel: 'Petrol'
  },
  {
    name: 'KTM Duke 390 ABS',
    type: 'Bike',
    pricePerDay: 1800,
    availability: true,
    description: 'The ultimate corner rocket! Lightweight trellis frame, aggressive TFT display, and thrilling acceleration.',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80',
    seats: 2,
    transmission: 'Manual',
    fuel: 'Petrol'
  },
  {
    name: 'Ather 450X Apex Electric',
    type: 'Scooter',
    pricePerDay: 800,
    availability: true,
    description: 'High-tech electric smart scooter with Google Maps navigation on dashboard, warp ride mode, and zero emissions.',
    imageUrl: 'https://images.unsplash.com/photo-1591522810850-58128c5fb089?auto=format&fit=crop&w=1000&q=80',
    seats: 2,
    transmission: 'Automatic',
    fuel: 'Electric'
  },
  {
    name: 'Kawasaki Ninja 300 Sport',
    type: 'Bike',
    pricePerDay: 2500,
    availability: true,
    description: 'Twin-cylinder powerhouse with racing pedigree styling, dual-channel ABS, and highway stability.',
    imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80',
    seats: 2,
    transmission: 'Manual',
    fuel: 'Petrol'
  },
  {
    name: 'Mahindra Thar 4x4 Earth Edition',
    type: 'SUV',
    pricePerDay: 4500,
    availability: true,
    description: 'Unbeatable rough terrain off-roader featuring commanding road presence, tough 4WD capabilities, and modern comforts.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    seats: 4,
    transmission: 'Automatic',
    fuel: 'Diesel'
  },
  {
    name: 'Tata Nexon EV Long Range',
    type: 'Electric',
    pricePerDay: 3200,
    availability: true,
    description: 'India’s favorite smart compact electric SUV offering whisper-quiet drives, fast DC charging, and tech-loaded cabin.',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Electric'
  },
  {
    name: 'Toyota Innova Hycross ZX',
    type: 'Luxury',
    pricePerDay: 6000,
    availability: true,
    description: 'Executive family MPV featuring self-charging hybrid power, powered captain seats, and plush ride quality.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Hybrid'
  },
  {
    name: 'BMW 5 Series M Sport',
    type: 'Luxury',
    pricePerDay: 12500,
    availability: true,
    description: 'German luxury executive sedan blending unmatched craftsmanship, ambient acoustics, and effortless agility.',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol'
  },
  {
    name: 'Hyundai Creta SX Tech',
    type: 'SUV',
    pricePerDay: 3500,
    availability: true,
    description: 'Feature-rich urban SUV featuring panoramic sunroof, Bose acoustics, ADAS safety suite, and effortless cruising.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol'
  },
  {
    name: 'Mercedes-Benz C-Class AMG Line',
    type: 'Sedan',
    pricePerDay: 11000,
    availability: true,
    description: 'Timeless prestige sedan boasting ambient cabin lighting, mild-hybrid performance, and executive refinement.',
    imageUrl: 'https://images.unsplash.com/photo-1618843479319-5612f0464673?auto=format&fit=crop&w=1000&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol'
  },
  {
    name: 'Royal Enfield Continental GT 650',
    type: 'Bike',
    pricePerDay: 2200,
    availability: true,
    description: 'Pure twin-cylinder cafe racer experience. Distinctive chrome styling, smooth high-speed performance, and legendary appeal.',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
    seats: 2,
    transmission: 'Manual',
    fuel: 'Petrol'
  },
  {
    name: 'Honda City ZX CVT',
    type: 'Sedan',
    pricePerDay: 2800,
    availability: true,
    description: 'The golden standard of reliable comfort sedans. Highly spacious rear seating, refined VTEC engine, and super smooth CVT.',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1000&q=80',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol'
  }
];

const seedIfEmpty = async () => {
  try {
    const vehicleCount = await Vehicle.countDocuments();
    const userCount = await User.countDocuments();
    
    if (vehicleCount === 0 && userCount === 0) {
      console.log('--- [Auto-Seed] Database is empty. Pre-loading initial bikes, cars and admin account ---');
      
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const customerPassword = await bcrypt.hash('customer123', salt);
      
      await User.create([
        {
          name: 'Royal Rental Admin',
          email: 'admin@royalrental.com',
          password: adminPassword,
          role: 'Admin'
        },
        {
          name: 'Rahul Customer',
          email: 'customer@royalrental.com',
          password: customerPassword,
          role: 'Customer'
        }
      ]);
      
      await Vehicle.insertMany(vehiclesData);
      console.log('--- [Auto-Seed] Seeded demo accounts and 12 cars & bikes with INR pricing successfully! ---');
    }
  } catch (error) {
    console.error('--- [Auto-Seed Error]:', error);
  }
};

module.exports = seedIfEmpty;
module.exports.vehiclesData = vehiclesData;
