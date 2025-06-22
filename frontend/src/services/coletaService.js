import axios from 'axios';
import  authService  from './authService'; 

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSolicitacoesColeta = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.tipoMaterial) params.append('tipoMaterial', filters.tipoMaterial);
    if (filters.status) params.append('status', filters.status);

    const { data } = await axios.get(`${API_BASE}/coletas?${params.toString()}`, {
      headers: getAuthHeader()
    });

    if (!data.success) throw new Error(data.message || 'Erro ao buscar coletas');

    return data.data.map(coleta => ({
      ...coleta,
      imagem: coleta.imagem?.startsWith('http')
        ? coleta.imagem
        : `${API_BASE}${coleta.imagem}`
    }));
  } catch (error) {
    console.error('Erro ao buscar coletas:', error);
    throw new Error(error.response?.data?.error || 'Erro ao buscar coletas');
  }
};

export const criarSolicitacaoColeta = async (formData) => {
  try {
    const { data } = await axios.post(`${API_BASE}/coletas`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    throw new Error(error.response?.data?.error || 'Erro ao criar solicitação');
  }
};

export const atualizarSolicitacaoColeta = async (id, formData) => {
  try {
    const { data } = await axios.put(`${API_BASE}/coletas/${id}`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    throw new Error(error.response?.data?.error || 'Erro ao atualizar solicitação');
  }
};

export const deletarSolicitacaoColeta = async (id) => {
  try {
    const { data } = await axios.delete(`${API_BASE}/coletas/${id}`, {
      headers: getAuthHeader(),
      validateStatus: (status) => status < 500 
    });

    if (!data.success) {
      throw new Error(data.message || 'Não foi possível excluir a solicitação');
    }

    return data;
  } catch (error) {
    console.error('Erro ao deletar solicitação:', error);

    let errorMessage = 'Erro ao deletar solicitação';
    if (error.response) {
      errorMessage = error.response.data.message ||
        error.response.data.error ||
        errorMessage;
    }

    throw new Error(errorMessage);
  }
};

export const aceitarColeta = async (idSolicitacao) => {
  try {
    const { data } = await axios.put(
      `${API_BASE}/coletas/${idSolicitacao}/aceitar`,
      {},
      { headers: getAuthHeader() }
    );

    if (!data.success) {
      throw new Error(data.message || 'Erro ao aceitar coleta');
    }

    return data;
  } catch (error) {
    console.error('Erro ao aceitar coleta:', error);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Erro ao aceitar coleta'
    );
  }
};

export const concluirColeta = async (idSolicitacao) => {
  console.log("Tentando concluir coleta ID:", idSolicitacao);
  try {
    const { data } = await authService.put(`/coletas/${idSolicitacao}/concluir`); // ✅ Corrigido aqui

    if (!data.success) {
      throw new Error(data.message || "Falha ao concluir coleta");
    }

    return data;
  } catch (error) {
    console.error("Erro completo ao concluir coleta:", {
      mensagem: error.message,
      status: error.response?.status,
      dados: error.response?.data,
      endpoint: `/coletas/${idSolicitacao}/concluir`,
    });

    throw new Error(
      error.response?.data?.message || "Erro ao processar conclusão da coleta. Tente novamente."
    );
  }
};
