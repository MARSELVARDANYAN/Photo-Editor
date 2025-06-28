// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
// });

// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
  
//   if (token && token.startsWith('Bearer ')) {
//     config.headers['x-auth-token'] = token;
//   } else if (token) {
//     config.headers['x-auth-token'] = `Bearer ${token}`;
//   }
  
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

// api.interceptors.response.use(response => {
//   const newToken = response.headers['x-refreshed-token'];
//   if (newToken) {
//     localStorage.setItem('token', newToken);
//   }
//   return response;
// }, error => {
//   if (error.response?.status === 401) {
//     localStorage.removeItem('token');
    
//     if (window.location.pathname !== '/login') {
//       window.location.href = '/login';
//     }
//   }
//   return Promise.reject(error);
// });

// export default api;


// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://photo-editor-1.onrender.com/api',
  timeout: 15000, 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers['x-auth-token'] = token;
    
    config.params = {
      ...config.params,
      _t: Date.now()
    };
  }
  
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  const newToken = response.headers['x-refreshed-token'];
  if (newToken) {
    localStorage.setItem('token', newToken);
    console.log('Token refreshed successfully');
  }
  
  return response;
}, error => {
  const originalRequest = error.config;
  
  if (error.response) {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      console.warn('Authentication failed, redirecting to login');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    if (error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Request setup error:', error.message);
  }
  
  return Promise.reject({
    ...error,
    message: error.response?.data?.message || 
             error.message || 
             'Unknown error occurred'
  });
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export default api;