// // client/src/context/AuthContext.jsx
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api.js';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // Проверка валидности токена
//   const validateToken = async () => {
//     if (!token) return false;

//     try {
//       // Проверяем токен через защищенный эндпоинт
//       await api.get('/auth/validate');
//       return true;
//     } catch (err) {
//       console.error('Token validation failed:', err);
//       return false;
//     }
//   };

//   // Инициализация аутентификации
//   useEffect(() => {
//     const initAuth = async () => {
//       setLoading(true);

//       if (token) {
//         try {
//           const isValid = await validateToken();

//           if (isValid) {
//             const res = await api.get('/auth/me');
//             setUser(res.data);
//           } else {
//             setToken(null);
//             localStorage.removeItem('token');
//           }
//         } catch (err) {
//           console.error('Auth initialization error:', err);
//           setToken(null);
//           localStorage.removeItem('token');
//         }
//       }

//       setLoading(false);
//     };

//     initAuth();
//   }, [token]);

//   useEffect(() => {
//     if (token) {
//       localStorage.setItem('token', token);
//     } else {
//       localStorage.removeItem('token');
//     }
//   }, [token]);

//   const register = async (username, password) => {
//     const { data } = await api.post('/auth/register', { username, password });
//     setToken(data.token);
//   };

//   const login = async (username, password) => {
//     const { data } = await api.post('/auth/login', { username, password });
//     setToken(data.token);
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       token,
//       loading,
//       register,
//       login,
//       logout
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// export default AuthContext;

// client/src/context/AuthContext.jsx
// client/src/context/AuthContext.jsx
// src/context/AuthContext.jsx
// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Проверка валидности токена
  const validateToken = useCallback(async (t) => {
    try {
      const response = await api.get("/auth/validate", {
        headers: { "x-auth-token": t },
      });
      return response.status === 200;
    } catch (err) {
      console.error("Token validation failed:", err);
      return false;
    }
  }, []);

  // Загрузка данных пользователя
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      return true;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      return false;
    }
  }, []);

  // Инициализация аутентификации
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Проверка токена в URL (для OAuth редиректа)
      const queryParams = new URLSearchParams(window.location.search);
      const urlToken = queryParams.get("token");

      if (urlToken) {
        localStorage.setItem("token", urlToken);
        api.defaults.headers.common["x-auth-token"] = urlToken;
        setToken(urlToken);
        window.history.replaceState({}, "", window.location.pathname);
      }

      const currentToken = urlToken || token;

      if (currentToken) {
        const isValid = await validateToken(currentToken);
        if (isValid) {
          await fetchUser();
        } else {
          logout(false);
        }
      }
      
      setAuthChecked(true);
      setLoading(false);
    };

    if (!authChecked) {
      initAuth();
    }
  }, [token, validateToken, fetchUser, authChecked]);

  // Установка заголовка токена
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["x-auth-token"] = token;
      localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["x-auth-token"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Регистрация
  const register = async (username, password) => {
    try {
      const { data } = await api.post("/auth/register", { username, password });
      setToken(data.token);
      await fetchUser();
      navigate("/");
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    }
  };

  // Логин
  const login = async (username, password) => {
    try {
      const { data } = await api.post("/auth/login", { username, password });
      setToken(data.token);
      await fetchUser();
      navigate("/");
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // Вход через Google
  const loginWithGoogle = (returnTo = "/") => {
    const encodedReturnTo = encodeURIComponent(returnTo);
    window.location.href = `${api.defaults.baseURL}/auth/google?returnTo=${encodedReturnTo}`;
  };

  // Вход через Facebook
  const loginWithFacebook = (returnTo = "/") => {
    const encodedReturnTo = encodeURIComponent(returnTo);
    window.location.href = `${api.defaults.baseURL}/auth/facebook?returnTo=${encodedReturnTo}`;
  };

  // Выход
  const logout = (redirect = true) => {
    setUser(null);
    setToken(null);
    setAuthChecked(false);
    localStorage.removeItem("token");
    if (redirect) navigate("/login");
  };

  // Установка токена (для OAuth редиректа)
  const setAuthToken = async (newToken) => {
    localStorage.setItem("token", newToken);
    api.defaults.headers.common["x-auth-token"] = newToken;
    setToken(newToken);
    
    // Ждем завершения проверки аутентификации
    setLoading(true);
    const isValid = await validateToken(newToken);
    if (isValid) {
      await fetchUser();
    }
    setLoading(false);
    
    return isValid;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authChecked,
        register,
        login,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        setAuthToken,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;