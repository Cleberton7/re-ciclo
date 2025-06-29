// Função para formatar datas
export const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

export const getMaterialIcon = (material) => {
  const icons = {
    plasticos: '♻️',
    metais: '🔩',
    eletronicos: '💻',
    outros: '🗑️'
  };
  return icons[material?.toLowerCase()] || icons.outros;
};
