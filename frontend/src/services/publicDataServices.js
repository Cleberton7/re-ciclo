// services/publicDataService.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getEmpresasPublicas = async () => {
  try {
    const response = await axios.get(`${API_BASE}/empresas/publicas`);
        return response.data.data.map(empresa => ({
      ...empresa,
      imagemPerfil: empresa.imagemPerfil || null
    }));
  } catch (error) {
    console.error('Erro ao buscar empresas públicas:', error);
    throw error;
  }
};

export const getCentrosReciclagemPublicos = async () => {
  try {
    const response = await axios.get(`${API_BASE}/centros-reciclagem/publicos`);
    return response.data.data.map(centroReciclagem => ({
      ...centroReciclagem,
    
      imagemPerfil: centroReciclagem.imagemPerfil || null
    }));
  } catch (error) {
    console.error('Erro ao buscar centro de reciclagem públicos:', error);
    throw error;
  }
};

export const getEmpresaPublicaPorId = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/empresas/publicas/${id}`);
    return {
      ...response.data.data,
      imagemPerfil: response.data.data.imagemPerfil || null
    };
  } catch (error) {
    console.error(`Erro ao buscar empresa com ID ${id}:`, error);
    throw error;
  }
};
