import React from 'react';
import "../pages/styles/RankingEmpresas.css";

const RankingEmpresas = ({ ranking = [] }) => {
  // Verificação mais completa dos dados
  if (!Array.isArray(ranking) || ranking.length === 0) {
    return (
      <div className="no-data-message">
        <p>Não há dados de ranking disponíveis no momento.</p>
      </div>
    );
  }

  // Função para obter o nome da empresa de forma segura
  const getNomeEmpresa = (empresa) => {
    if (!empresa) return 'Nome não disponível';
    
    // Verifica vários campos possíveis para o nome
    return empresa.nomeFantasia || 
           empresa.razaoSocial || 
           empresa.nome || 
           empresa.empresa?.nome || 
           'Empresa não identificada';
  };

  return (
    <div className="ranking-container">
      <h2>Ranking de Empresas</h2>
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
          {ranking.map((empresa, index) => {
            // Debug: Mostra os dados completos da empresa no console
            console.log(`Dados da empresa ${index + 1}:`, empresa);
            
            return (
              <tr key={empresa._id || index}>
                <td>{index + 1}</td>
                <td>{getNomeEmpresa(empresa)}</td>
                <td>{(empresa.totalColetado || 0).toLocaleString('pt-BR')}</td>
                <td>{empresa.coletasConcluidas || 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RankingEmpresas;