import axios from 'axios';

const API_URL = 'http://localhost:5000/api/coletas'; // Rota do backend

export const getSolicitacoesColeta = async (filtros = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
      params: filtros, // Envia filtros como query params
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar dados');
  }
};

export const aceitarColeta = async (coletaId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/${coletaId}/aceitar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao aceitar coleta:', error);
    throw new Error(error.response?.data?.message || 'Falha ao aceitar coleta');
  }
};