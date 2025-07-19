// utils/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token'); // or wherever you store your JWT

  if (!token) {
    // not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
