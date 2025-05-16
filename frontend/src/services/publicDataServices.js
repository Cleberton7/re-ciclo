// services/publicDataService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getEmpresasPublicas = async () => {
  try {
    const response = await axios.get(`${API_BASE}/empresas/publicas`);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar empresas públicas:', error);
    throw error;
  }
};

export const getColetoresPublicos = async () => {
  try {
    const response = await axios.get(`${API_BASE}/coletor/publicos`);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar coletores públicos:', error);
    throw error;
  }
};