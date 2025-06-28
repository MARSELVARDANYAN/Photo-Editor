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
import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Проверка валидности токена
  const validateToken = useCallback(async (t) => {
    if (!t) return false;

    try {
      await api.get("/auth/validate", {
        headers: { "x-auth-token": t },
      });
      return true;
    } catch (err) {
      console.error("Token validation failed:", err);
      return false;
    }
  }, []);

  // Загрузка данных пользователя
  const fetchUser = useCallback(async () => {
    if (!token) return;

    try {
      const res = await api.get("/auth/me", {
        headers: { "x-auth-token": token },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout(false);
    }
  }, [token]);

  // Инициализация аутентификации
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Проверка токена в URL (для OAuth редиректа)
      const queryParams = new URLSearchParams(window.location.search);
      const urlToken = queryParams.get("token");

      if (urlToken) {
        localStorage.setItem("token", urlToken);
        setToken(urlToken);
        window.history.replaceState({}, "", window.location.pathname);
      }

      // Проверка валидности токена
      const currentToken = urlToken || token;
      if (currentToken && (await validateToken(currentToken))) {
        api.defaults.headers.common["x-auth-token"] = currentToken;
        await fetchUser();
      } else {
        logout(false);
      }

      setLoading(false);
    };

    initAuth();
  }, [token, validateToken, fetchUser]);

  // Установка заголовка токена при изменении
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
    const { data } = await api.post("/auth/register", { username, password });
    setToken(data.token);
    await fetchUser();
    navigate("/");
  };

  // Логин
  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    setToken(data.token);
    await fetchUser();
    navigate("/");
  };

  // Вход через Google
  const loginWithGoogle = (returnTo = "/") => {
    window.location.href = `${api.defaults.baseURL}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  // Вход через Facebook
  const loginWithFacebook = (returnTo = "/") => {
    window.location.href = `${api.defaults.baseURL}/auth/facebook?returnTo=${encodeURIComponent(returnTo)}`;
  };

  // Выход
  const logout = (redirect = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    if (redirect) navigate("/login");
  };

  // Установка токена (для OAuth редиректа)
  const setAuthToken = (newToken) => {
    setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;