// services/publicDataService.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getEmpresasPublicas = async () => {
  try {
    const response = await axios.get(`${API_BASE}/public-routes/publicas`);
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
    const response = await axios.get(`${API_BASE}/public-routes/publicos`);
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
    const response = await axios.get(`${API_BASE}/public-routes/publicas/${id}`);
    return {
      ...response.data.data,
      imagemPerfil: response.data.data.imagemPerfil || null
    };
  } catch (error) {
    console.error(`Erro ao buscar empresa com ID ${id}:`, error);
    throw error;
  }
};

export const getCentroPublicoPorId = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/public-routes/publicos/${id}`);
    return {
      ...response.data.data,
      imagemPerfil: response.data.data.imagemPerfil || null
    };
  } catch (error) {
    console.error(`Erro ao buscar centro com ID ${id}:`, error);
    throw error;
  }
};

// 🔹 Buscar empresas por proximidade
export const getEmpresasPorProximidade = async (coordenadas, raioMetros) => {
  try {

    
    const response = await axios.get(`${API_BASE}/public-routes/empresas/proximidade`, {
      params: {
        lat: coordenadas.lat,
        lng: coordenadas.lng,
        raio: raioMetros
      }
    });


    return response.data.data;
  } catch (error) {
    console.error('❌ [SERVICE ERROR] Erro ao buscar empresas:', error.response?.data || error.message);
    throw error;
  }
};

// 🔹 Buscar centros por proximidade
export const getCentrosPorProximidade = async (coordenadas, raioMetros) => {
  try {
  
    
    const response = await axios.get(`${API_BASE}/public-routes/centros/proximidade`, {
      params: {
        lat: coordenadas.lat,
        lng: coordenadas.lng,
        raio: raioMetros
      }
    });


    return response.data.data;
  } catch (error) {
    console.error('❌ [SERVICE ERROR] Erro ao buscar centros:', error.response?.data || error.message);
    throw error;
  }
};

// 🔹 Função genérica para buscar pontos por proximidade
export const getPontosPorProximidade = async (tipo, coordenadas, raioMetros) => {
  if (tipo === 'empresa') {
    return await getEmpresasPorProximidade(coordenadas, raioMetros);
  } else if (tipo === 'centro') {
    return await getCentrosPorProximidade(coordenadas, raioMetros);
  }
  return [];
};