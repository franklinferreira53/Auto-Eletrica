import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingScreen from '../ui/LoadingScreen';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;