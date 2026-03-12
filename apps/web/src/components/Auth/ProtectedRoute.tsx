import { Navigate, useLocation } from 'react-router-dom';
import { PremiumLoader } from '../ui/PremiumLoader';
import { useStore } from '../../store/useStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'user' | 'admin';
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    redirectTo = '/login'
}) => {
    const { isAuthenticated, user, isLoading } = useStore();
    const location = useLocation();

    if (isLoading) {
        return <PremiumLoader />;
    }

    if (!isAuthenticated) {
        // Build the full path including search params and hash to preserve state after login
        const fullPath = location.pathname + location.search + location.hash;
        return <Navigate to={`${redirectTo}?redirect=${encodeURIComponent(fullPath)}`} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
