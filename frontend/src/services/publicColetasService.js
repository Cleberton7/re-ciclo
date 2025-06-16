import axios from 'axios';
import  authService  from '../services/authService'; // ✅ Corrigido aqui

const API_BASE = 'http://localhost:5000/api';

export const getDadosPublicosColetas = async (filters = {}) => {
  try {
    const params = {
      tipoMaterial: filters.tipoMaterial || '',
      periodo: filters.periodo || 'mensal',
      limit: 6
    };
    const { data } = await axios.get(`${API_BASE}/public/coletas`, { params });

    if (!data.data) {
      console.warn('Resposta da API não contém data.data:', data);
      return [];
    }
    return data.data || [];
  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw new Error(error.response?.data?.message || 'Erro ao buscar coletas');
  }
};

export const getRankingEmpresas = async (periodo = 'mensal') => {
  try {
    const { data } = await axios.get(`${API_BASE}/public/ranking`, {
      params: { periodo, limit: 10 }
    });
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar ranking');
  }
};

export const getEstatisticasPublicas = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/public/estatisticas`);
    return data.data || {
      totalColetado: 0,
      empresasAtivas: 0,
      impactoAmbiental: 0
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar estatísticas');
  }
};

export const getDistribuicaoMateriais = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/public/distribuicao`);
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar distribuição:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar distribuição');
  }
};

export const concluirColeta = async (idSolicitacao) => {
  try {
    console.log(`Tentando concluir coleta ID: ${idSolicitacao}`);

    const { data } = await authService.put(`/coletas/${idSolicitacao}/concluir`); // ✅ Corrigido aqui

    if (!data.success) {
      console.error('Erro no backend:', {
        mensagem: data.message,
        codigo: data.code // se existir
      });
      throw new Error(data.message || 'Falha ao concluir coleta');
    }

    console.log('Coleta concluída com sucesso:', data);
    return data;

  } catch (error) {
    const errorDetails = {
      mensagem: error.message,
      status: error.response?.status,
      dados: error.response?.data,
      endpoint: error.config?.url
    };

    console.error('Erro completo ao concluir coleta:', errorDetails);

    throw new Error(
      error.response?.data?.message ||
      'Erro ao processar conclusão da coleta. Tente novamente.'
    );
  }
};
