import api from './api.js';

export const register = (username, password) => 
  api.post('/auth/register', { username, password });

export const login = (username, password) => 
  api.post('/auth/login', { username, password });