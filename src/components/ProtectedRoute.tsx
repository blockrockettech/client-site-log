import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'client';
  allowedRoles?: Array<'admin' | 'staff' | 'client'>;
}

/**
 * ProtectedRoute component that handles authentication and authorization
 * 
 * @param children - The component(s) to render if access is allowed
 * @param requiredRole - Specific role required to access this route
 * @param allowedRoles - Array of roles allowed to access this route (alternative to requiredRole)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to auth page if user is not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated but profile is not loaded yet, show loading
  if (!profile) {
    return <LoadingSpinner />;
  }

  // Check role-based authorization
  const hasAccess = (() => {
    if (requiredRole) {
      return profile.role === requiredRole;
    }
    
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(profile.role as 'admin' | 'staff' | 'client');
    }
    
    // If no role restrictions specified, allow access for any authenticated user
    return true;
  })();

  // Redirect to dashboard if user doesn't have required permissions
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

/**
 * Higher-order component for protecting routes with specific role requirements
 */
export const withRoleProtection = (
  Component: React.ComponentType,
  requiredRole?: 'admin' | 'staff' | 'client',
  allowedRoles?: Array<'admin' | 'staff' | 'client'>
) => {
  return (props: any) => (
    <ProtectedRoute requiredRole={requiredRole} allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Convenience components for specific roles
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'staff']}>{children}</ProtectedRoute>
);

export const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'staff', 'client']}>{children}</ProtectedRoute>
);
