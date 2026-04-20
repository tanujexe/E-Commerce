
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function PrivateRoute() {
  const { user, loading } = useAuth(); // 🔥 FIX
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  return user
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
}