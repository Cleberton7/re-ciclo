import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
});

// Intercepta e adiciona o token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Login
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

// Registro
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Dados do usuário autenticado
export const getUserData = async () => {
  const response = await api.get('/usuario/pessoal');
  return response.data;
};

export default {
  loginUser,
  registerUser,
  getUserData
};