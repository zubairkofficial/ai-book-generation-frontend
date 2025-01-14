import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store/store';

const AuthRedirect: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If the user is authenticated, redirect to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, allow access to the auth page
  return null;
};

export default AuthRedirect;