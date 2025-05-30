import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getDadosPublicosColetas = async (filters) => {
  try {
    const params = {
      tipoMaterial: filters.tipoMaterial || '',
      periodo: filters.periodo || 'mensal',
      limit: 6
    };
    
    const response = await axios.get(`${API_BASE}/public/coletas`, { params });
    return response.data?.data || [];
  } catch (error) {
    console.error('Erro ao buscar coletas públicas:', error);
    return [];
  }
};

export const getRankingEmpresas = async (periodo = 'mensal') => {
  try {
    const response = await axios.get(`${API_BASE}/public/ranking`, {
      params: { periodo, limit: 10 }
    });
    return response.data?.data || [];
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return [];
  }
};

export const getEstatisticasPublicas = async () => {
  try {
    const response = await axios.get(`${API_BASE}/public/estatisticas`);
    return response.data?.data || {
      totalColetado: 0,
      empresasAtivas: 0,
      impactoAmbiental: 0
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      totalColetado: 0,
      empresasAtivas: 0,
      impactoAmbiental: 0
    };
  }
};
export const getDistribuicaoMateriais = async () => {
  try {
    const response = await axios.get(`${API_BASE}/public/distribuicao`);
    return response.data.data || [];
  } catch (error) {
    console.error('Erro ao buscar distribuição:', error);
    return [];
  }
};