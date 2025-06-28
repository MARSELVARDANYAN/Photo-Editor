// src/components/PrivateRoute.jsx
import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, loading, authChecked } = useContext(AuthContext);
  const location = useLocation();

  if (loading || !authChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;