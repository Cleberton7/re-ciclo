import axios from 'axios';
import * as jwtDecode from 'jwt-decode';


const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000, // Aumente o timeout para 30 segundos
});

// Verifica se token está expirado
const isTokenExpired = (token) => {
  try {
  const decoded = jwtDecode(token);

    return decoded.exp < Date.now() / 1000;
  } catch (e) {
    console.error(e);
    return true;
  }
};

// Intercepta requisições para incluir o token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      return Promise.reject(new Error('Token expirado'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  if (error.code === 'ECONNABORTED') {
    console.error('Timeout na requisição:', error.config.url);
  }
  return Promise.reject(error);
});

// Intercepta respostas para tratar erros globais
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      // Tentar novamente uma vez
      return api.request(error.config);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
