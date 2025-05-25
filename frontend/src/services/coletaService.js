import axios from 'axios';

const API_BASE =  'http://localhost:5000/api';

export const getSolicitacoesColeta = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    if (filters.tipoResiduo) params.append('tipoMaterial', filters.tipoResiduo);
    if (filters.status) params.append('status', filters.status);
    
    const response = await axios.get(`${API_BASE}/coletas?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.data || []; // retorna só o array direto
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    throw error;
  }
};


export const criarSolicitacaoColeta = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/coletas`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    throw error;
  }
};

export const atualizarColeta = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE}/coletas/${id}`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar coleta:', error);
    throw error;
  }
};

export const aceitarColeta = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE}/coletas/${id}/aceitar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao aceitar coleta:', error);
    throw error;
  }
};