
export const getPeriodoFilter = (periodo) => {
  const now = new Date();
  let startDate;

  switch (periodo) {
    case 'mensal':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'trimestral':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case 'anual':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case 'total':
    default:
      return {};
  }

  return { dataSolicitacao: { $gte: startDate } };
};
