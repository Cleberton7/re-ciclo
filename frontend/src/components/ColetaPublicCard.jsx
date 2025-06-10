import React from 'react';
import { formatDate, getMaterialIcon } from '../utils/helpers';
import "../pages/styles/ColetaPublicCards.css"


const ColetaPublicCard = ({ coleta }) => {
  if (!coleta || !coleta._id) {
    console.warn('Coleta inválida:', coleta);
    return null;
  }
  // Debug: Verifique a estrutura do objeto coleta
  console.log('Dados da coleta:', coleta);
  if (!coleta) return null;

  return (
    <div className="coleta-public-card">
      <div className="card-header">
        <div className="material-badge">
          <span className={`material-icon ${getMaterialIcon(coleta.tipoMaterial)}`}>
            {getMaterialIcon(coleta.tipoMaterial)}
          </span>
          <span className="material-type">{coleta.tipoMaterial}</span>
        </div>
        <span className={`status-badge ${coleta.status}`}>
          {coleta.status.replace('_', ' ')}
        </span>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="info-label">Empresa:</span>
          <span className="info-value">
            {coleta.solicitante?.nomeFantasia || coleta.solicitante?.razaoSocial || 'Não informado'}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Quantidade:</span>
          <span className="info-value">
            {coleta.quantidade} kg
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Data:</span>
          <span className="info-value">
            {formatDate(coleta.dataColeta || coleta.createdAt)}
          </span>
        </div>
      </div>

      <div className="card-footer">
        <div className="impact-info">
          <span className="impact-icon">🌱</span>
          <span className="impact-text">
            Equivale a {Math.floor(coleta.quantidade / 100)} árvores preservadas
          </span>
        </div>
      </div>
    </div>
    
  );
};

export default ColetaPublicCard;