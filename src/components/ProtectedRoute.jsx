import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) {
    return null;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
