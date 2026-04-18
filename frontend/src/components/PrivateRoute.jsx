/**
 * PrivateRoute — redirects to /login if not authenticated
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function PrivateRoute() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  return isLoggedIn
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
}
