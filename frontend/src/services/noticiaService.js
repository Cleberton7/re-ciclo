import axios from 'axios';

const API_URL = 'http://localhost:5000/api/noticias';

// Pega token do localStorage para enviar no header (com verificação)
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token não encontrado no localStorage');
    return {};
  }
  
  // Verifica se o token está válido (não expirado)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.error('Token expirado');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload(); // Força recarregamento para redirecionar para login
      return {};
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return {};
  }

  return { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json' // Adicione isso para requisições JSON
  };
};

export const listarNoticias = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error('Erro ao listar notícias:', error.response?.data || error.message);
    throw error;
  }
};

export const criarNoticia = async (formData) => {
  try {
    const headers = {
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data',
    };
    
    //console.log('Enviando headers:', headers); // Log para depuração
    
    const res = await axios.post(API_URL, formData, { headers });
    return res.data;
  } catch (error) {
    console.error('Erro ao criar notícia:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const atualizarNoticia = async (id, formData) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error.response?.data || error.message);
    throw error;
  }
};

export const deletarNoticia = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, { 
      headers: getAuthHeader() 
    });
    return res.data;
  } catch (error) {
    console.error('Erro ao deletar notícia:', error.response?.data || error.message);
    throw error;
  }
};