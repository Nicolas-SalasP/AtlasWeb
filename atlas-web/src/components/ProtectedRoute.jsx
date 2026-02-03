import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) return <div className="p-10">Verificando permisos...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (requiredRole && user.role_id !== requiredRole) {
        return <Navigate to="/mis-tickets" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;