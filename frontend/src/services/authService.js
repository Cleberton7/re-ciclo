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
  const response = await api.get('/usuario/pessoal');
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
// ✅ Aqui exporta a instância do axios corretamente
export default api;
