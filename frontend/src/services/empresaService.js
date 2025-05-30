import api from './api';

export const getLocalizacoesEmpresas = async () => {
  const response = await api.get('/empresas/localizacoes');
  return response.data;
};

export const getDadosEmpresa = async (id) => {
  const response = await api.get(`/empresas/${id}`);
  return response.data;
};

// Outras funções específicas de empresa...
