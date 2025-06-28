// oauth-redirect.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const OAuthRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    console.log('OAuth Redirect Params:', { token, error });
    
    if (error) {
      toast.error(`Authorization error: ${error}`);
      navigate('/login');
      return;
    }
    
    if (token) {
      localStorage.setItem('token', token);
      
      const returnTo = searchParams.get('state') || '/';
      navigate(returnTo);
      
      window.location.reload();
    } else {
      toast.error('Token not found in URL');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg">finished authorization...</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;