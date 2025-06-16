// Função para formatar datas
export const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

// Função para obter ícones de materiais
export const getMaterialIcon = (material) => {
  const icons = {
    plástico: '♻️',
    metal: '🔩',
    eletrônicos: '💻',
    outros: '🗑️'
  };
  return icons[material.toLowerCase()] || icons.outros;
};