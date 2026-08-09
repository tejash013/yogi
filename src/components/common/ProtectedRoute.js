import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
export default function ProtectedRoute({ children, roles, redirectTo = '/auth/login', }) {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: redirectTo, state: { from: location }, replace: true });
    }
    if (roles && user && !roles.includes(user.role)) {
        return _jsx(Navigate, { to: "/error/403", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
