import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Import your layouts and pages here
// For now, let's create a simple placeholder

const Home = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Athlete Management System</h1>
    <p>Welcome to the Athlete Management System</p>
  </div>
);

const App: React.FC = () => {
  // You can add authentication logic here
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default App;