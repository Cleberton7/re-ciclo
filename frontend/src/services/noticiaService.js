import axios from 'axios';

const API_URL = 'http://localhost:5000/api/noticias';

// Pega token do localStorage para enviar no header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listarNoticias = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const criarNoticia = async (noticia) => {
  const res = await axios.post(API_URL, noticia, { headers: getAuthHeader() });
  return res.data;
};

export const atualizarNoticia = async (id, noticia) => {
  const res = await axios.put(`${API_URL}/${id}`, noticia, { headers: getAuthHeader() });
  return res.data;
};

export const deletarNoticia = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
  return res.data;
};
