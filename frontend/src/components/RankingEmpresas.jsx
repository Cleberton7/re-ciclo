import React from 'react';

const RankingEmpresas = ({ ranking }) => {
  if (!ranking || ranking.length === 0) {
    return <p>Não há dados de ranking disponíveis no momento.</p>;
  }

  return (
    <div className="ranking-container">
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
              <td>{empresa.nomeFantasia || empresa.razaoSocial}</td>
              <td>{empresa.totalColetado?.toLocaleString() || 0}</td>
              <td>{empresa.coletasConcluidas || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingEmpresas;