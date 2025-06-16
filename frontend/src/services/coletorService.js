import api from './api';

export const getLocalizacoesColetores = async () => {
  const response = await api.get('/centros-reciclagem/localizacoes');
  return response.data;
};

export const getDadosColetor = async (id) => {
  const response = await api.get(`/centros-reciclagem/${id}`);
  return response.data;
};

