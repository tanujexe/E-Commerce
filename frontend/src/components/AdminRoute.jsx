/**
 * AdminRoute — redirects non-admins away from admin pages
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function AdminRoute() {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/"      replace />;

  return <Outlet />;
}
