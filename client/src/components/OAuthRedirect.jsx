// src/components/OAuthRedirect.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Box, CircularProgress, Typography } from '@mui/material';

const OAuthRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processAuth = async () => {
      const token = searchParams.get('token');
      const state = searchParams.get('state') || '/';
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      try {
        const isValid = await setAuthToken(token);
        if (isValid) {
          navigate(state);
        } else {
          setError('Invalid authentication token');
        }
      } catch (err) {
        console.error('Authentication failed:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    processAuth();
  }, [searchParams, navigate, setAuthToken]);

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Authentication Error
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Completing authentication...
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Please wait while we set up your account
      </Typography>
    </Box>
  );
};

export default OAuthRedirect;