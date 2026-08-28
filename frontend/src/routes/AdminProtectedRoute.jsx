import { Navigate, useLocation } from 'react-router-dom';

const ADMIN_TOKEN_KEY = 'adminToken';

/**
 * Redirects to /admin/login if no adminToken is stored in localStorage.
 */
export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const token    = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
