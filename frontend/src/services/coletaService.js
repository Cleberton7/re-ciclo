import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getSolicitacoesColeta = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    if (filters.tipoMaterial) params.append('tipoMaterial', filters.tipoMaterial);
    if (filters.status) params.append('status', filters.status);
    
    const response = await axios.get(`${API_BASE}/coletas?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao buscar coletas');
    }

    return response.data.data;

  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar solicitações de coleta');
  }
};

export const criarSolicitacaoColeta = async (dadosColeta) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(`${API_BASE}/coletas`, dadosColeta, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;

  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    throw new Error(error.response?.data?.message || 'Erro ao criar solicitação de coleta');
  }
};