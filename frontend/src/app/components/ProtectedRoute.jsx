import React from 'react';
import { Navigate } from 'react-router';
import { useAppSelector } from '../hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}
