import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function AdminProtectedRoute({ children }) {
  const { isAdminAuthenticated, isReady } = useAuth();
  if (!isReady) {
    return null;
  }
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

export default AdminProtectedRoute;
