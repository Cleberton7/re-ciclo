import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Enviando token no header:', token.substring(0, 20) + '...');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('Nenhum token encontrado no localStorage');
  }
  return config;
}, error => {
  console.error('Erro no interceptor:', error);
  return Promise.reject(error);
});

export const loginUser = async (credentials) => {
  try {
    console.log('Iniciando login com:', credentials.email);
    const response = await api.post('/auth/login', credentials);
    
    if (!response.data.token) {
      throw new Error('Token não recebido na resposta');
    }
    
    console.log('Login bem-sucedido, token recebido');
    return response.data;
  } catch (error) {
    console.error('Erro no login:', {
      message: error.message,
      response: error.response?.data
    });
    throw new Error(error.response?.data?.message || "Erro ao fazer login");
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao registrar usuário");
  }
};

export const getUserData = async () => {
  try {
    const response = await api.get('/usuario/pessoal');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao carregar dados");
  }
};

export default {
  loginUser,
  registerUser,
  getUserData
};