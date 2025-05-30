import api from './api';

export const getLocalizacoesColetores = async () => {
  const response = await api.get('/coletor/localizacoes');
  return response.data;
};

export const getDadosColetor = async (id) => {
  const response = await api.get(`/coletor/${id}`);
  return response.data;
};

// Outras funções específicas de coletor...
