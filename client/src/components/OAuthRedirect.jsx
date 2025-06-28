// src/components/OAuthRedirect.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Предполагается, что у вас есть AuthContext

const OAuthRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // Получаем функцию login из контекста

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const state = searchParams.get('state') || '/';

    console.log('OAuthRedirect params:', { token, error, state });

    if (error) {
      console.error('OAuth Error:', error);
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      try {
        // Сохраняем токен через контекст аутентификации
        login(token);
        
        // Перенаправляем на указанную страницу
        navigate(state);
      } catch (e) {
        console.error('Token processing error:', e);
        navigate(`/login?error=${encodeURIComponent('token_processing_error')}`);
      }
    } else {
      console.error('Token not found in OAuth redirect');
      navigate('/login?error=token_not_found');
    }
  }, [searchParams, navigate, login]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Завершаем авторизацию...</p>
    </div>
  );
};

export default OAuthRedirect;