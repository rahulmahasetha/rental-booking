# Royal Rentals - Car & Bike Booking System

Welcome to **Royal Rentals**, a modern and premium vehicle rental platform that allows users to seamlessly browse, book, and manage luxury cars and motorbikes. 

## 🚀 Features

- **User Authentication:** Secure signup and login for both customers and administrators.
- **Vehicle Catalog:** Browse a diverse fleet of cars and bikes with filtering options.
- **Booking Management:** Users can reserve vehicles, select dates, and view their booking history.
- **Admin Dashboard:** A dedicated control panel for administrators to manage the vehicle inventory (add, edit, delete) and view all user bookings.
- **Premium UI:** A sleek, responsive, and modern user interface built for the best user experience.

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **State Management & Routing:** React Router, Context API

## 📂 Project Structure

The repository is divided into two main sections:

- `/frontend` - Contains the React application and all user interface components.
- `/backend` - Contains the Express server, REST API endpoints, models, and database seeds.

## ⚙️ Getting Started

### Prerequisites
- Node.js installed on your machine
- MongoDB instance running locally or via MongoDB Atlas

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Start the backend development server:
```bash
npm run dev
```
*The backend server typically runs on `http://localhost:5000`.*

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend application will be available at `http://localhost:5173`.*

## 👤 Default Accounts

For testing purposes, the database seeding script provides the following default accounts:

- **Admin Account:** `admin@royalrental.com`
- **Customer Account:** `customer@royalrental.com`

---
*Built with ❤️ for Royal Rentals.*
