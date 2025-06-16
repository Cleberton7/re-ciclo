import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  withCredentials: true, // Importante para enviar cookies
});

// Intercepta e adiciona o token automaticamente
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
// No seu arquivo authService.js
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login'; // Ou use seu sistema de roteamento
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  
  if (!response.data.token || !response.data.usuario) {
    throw new Error('Resposta de login inválida');
  }

  return {
    token: response.data.token,
    usuario: response.data.usuario
  };
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getUserData = async () => {
  const response = await api.get('/usuarios/pessoal');
  return response.data;
};
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/request-password-reset', { email });
  return response.data;
};

export const resetPassword = async (token, novaSenha) => {
  const response = await api.post('/auth/reset-password', { token, novaSenha });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
};

export const resendVerificationEmail = async (email) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

const authService = {
  loginUser,
  registerUser,
  getUserData,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
};

export default authService;
