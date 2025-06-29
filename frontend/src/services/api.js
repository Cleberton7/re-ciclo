import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true
});

// Verifica se token JWT está expirado
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (e) {
    console.error('Erro ao decodificar token:', e);
    return true;
  }
};

// Interceptor de requisição
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  
  if (token) {
    if (isTokenExpired(token)) {
      console.warn('Token expirado - removendo do storage');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login?error=token_expired';
      return Promise.reject(new Error('Token expirado'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error('Erro no interceptor de requisição:', error);
  return Promise.reject(error);
});

// Interceptor de resposta
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Não autorizado - redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login?error=session_expired';
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição:', error.config.url);
      error.message = 'A requisição demorou muito - tente novamente';
    }
    
    return Promise.reject(error);
  }
);

export default api;