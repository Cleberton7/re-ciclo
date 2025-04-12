// authService.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Atualize para o backend rodando na porta 5000
});

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData); 
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData); // Corrigir para '/auth/login'
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};
