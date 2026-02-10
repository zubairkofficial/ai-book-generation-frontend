import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../store/store';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // If the user is not authenticated, redirect to the auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check user status (unless admin)
  if (user?.role !== 'admin') {
    if (user?.status === 'PENDING_PAYMENT') {
      return <Navigate to="/auth/payment" replace state={{ userId: user.id }} />;
    }
    if (user?.status === 'PENDING_APPROVAL') {
      return <Navigate to="/auth/approval-pending" replace />;
    }
    if (user?.status === 'REJECTED') {
      return <Navigate to="/auth/approval-pending" replace />; // Redirect to approval pending (or rejected page if created)
    }
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;