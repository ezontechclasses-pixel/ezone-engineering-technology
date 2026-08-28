import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps any route that requires authentication.
 * Saves the attempted URL so we can redirect back after login.
 */
export default function ProtectedRoute({ children }) {
  const { student } = useAuth();
  const location = useLocation();

  if (!student) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
