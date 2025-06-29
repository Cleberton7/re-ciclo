import axios from 'axios';
import authService from './authService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Função auxiliar para tratamento de erros
const handleApiError = (error, defaultMessage) => {
  console.error('Erro na requisição:', error);
  
  // Verifica se há resposta do servidor
  if (error.response) {
    const serverError = error.response.data;
    console.log('Detalhes do erro:', serverError);
    
    // Retorna mensagem mais específica quando disponível
    return new Error(
      serverError.message || 
      serverError.error || 
      serverError.details?.[0]?.message || 
      defaultMessage
    );
  }
  
  return new Error(error.message || defaultMessage);
};

export const criarSolicitacaoColeta = async (formData) => {
  try {
    // Verifica se os campos obrigatórios estão presentes
    if (!formData.get('tipoMaterial') || !formData.get('quantidade') || !formData.get('endereco')) {
      throw new Error('Campos obrigatórios não preenchidos');
    }

    const response = await axios.post(`${API_BASE}/coletas`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: (data) => data, // Impede transformação automática do axios
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao criar solicitação');
    }

    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Erro ao criar solicitação de coleta');
  }
};

// ... (mantenha as outras funções como estão)
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
      validateStatus: (status) => status < 500 // Para capturar erros 400 e 404 como respostas normais
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

export const concluirColeta = async (idSolicitacao, dados = {}) => {
  try {
    // Garante que as datas estão no payload
    const payload = {
      ...dados,
      dataColeta: dados.dataColeta || new Date().toISOString(),
      dataConclusao: dados.dataConclusao || new Date().toISOString()
    };

    const { data } = await axios.put(
      `${API_BASE}/coletas/${idSolicitacao}/concluir`,
      payload,
      { headers: getAuthHeader() }
    );

    if (!data.success) {
      throw new Error(data.message || "Falha ao concluir coleta");
    }

    return data;
  } catch (error) {
    console.error("Detalhes do erro:", error.response?.data);
    throw new Error(
      error.response?.data?.error || 
      "Erro ao concluir coleta. Verifique sua conexão e tente novamente."
    );
  }
};