// src/utils.js

// Formata código de rastreamento (ex: 20230910-3)
export const formatarCodigoRastreamento = (codigo) => {
  if (!codigo) return "";
  if (codigo.length <= 5) return codigo;
  return `${codigo.substring(0, 5)}-${codigo.substring(5, 10)}`;
};

// Formata tipo de material
export const formatarTipoMaterial = (tipo, outros) => {
  if (!tipo) return "Desconhecido";
  if (tipo === "outros" && outros) return `Outros (${outros})`;

  switch (tipo) {
    case "telefonia":
      return "Telefonia e Acessórios";
    case "informatica":
      return "Informática";
    case "eletrodomesticos":
      return "Eletrodomésticos";
    case "pilhas_baterias":
      return "Pilhas e Baterias";
    case "outros":
      return "Outros Eletroeletrônicos";
    default:
      return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }
};

// Formata datas para pt-BR
export const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

// Retorna ícone correspondente ao material
export const getMaterialIcon = (material) => {
  const icons = {
    telefonia: '📱',
    informatica: '💻',
    eletrodomesticos: '🏠',
    pilhas_baterias: '🔋',
    outros: '📦',
  };
  return icons[material?.toLowerCase()] || icons.outros;
};
