import React from 'react';
import "../pages/styles/RankingEmpresas.css";

const RankingEmpresas = ({ ranking = [], compactMode = false, hideTitle = false }) => {
  if (!Array.isArray(ranking) || ranking.length === 0) {
    return (
      <div className={`ranking-container ${compactMode ? 'compact' : ''}`}>
        <p>Não há dados de ranking disponíveis no momento.</p>
      </div>
    );
  }

  const getNomeEmpresa = (empresa) => {
    if (!empresa) return 'Nome não disponível';
    return empresa.nomeFantasia || 
           empresa.razaoSocial || 
           empresa.nome || 
           empresa.empresa?.nome || 
           'Empresa não identificada';
  };

  return (
    <div className={`ranking-container ${compactMode ? 'compact' : ''}`}>
      {!hideTitle && <h2>Ranking de Empresas</h2>}
      <table>
        <thead>
          <tr>
            <th>Posição</th>
            <th>Empresa</th>
            <th>Total Coletado (kg)</th>
            <th>Coletas Concluídas</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((empresa, index) => (
            <tr key={empresa._id || index}>
              <td>{index + 1}</td>
              <td>{getNomeEmpresa(empresa)}</td>
              <td>{(empresa.totalColetado || 0).toLocaleString('pt-BR')}</td>
              <td>{empresa.coletasConcluidas || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingEmpresas;