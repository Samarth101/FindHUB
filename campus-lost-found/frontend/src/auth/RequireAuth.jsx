import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function RequireAuth({ children, role }) {
  const { user } = useAuth();
  
  // For now, bypass auth so development is easier!
  // if (!user) return <Navigate to="/login" replace />;
  
  return children;
}
