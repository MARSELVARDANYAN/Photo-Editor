// client/src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PrivateRoute = () => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-fullscreen">Loading...</div>;
  }
  
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;