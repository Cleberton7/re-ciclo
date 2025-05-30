import React from 'react';
import '../pages/styles/ColetaCard.css';

const ColetaCard = ({ coleta, role, onAccept, onEdit, onCancel }) => {
  const getStatusColor = () => {
    switch(coleta.status) {
      case 'pendente': return '#FFC107';
      case 'aceita': return '#2196F3';
      case 'em_andamento': return '#4CAF50';
      case 'concluída': return '#607D8B';
      case 'cancelada': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="coleta-card">
      <div className="coleta-header">
        <h3 className="coleta-tipo">{coleta.tipoMaterial}</h3>
        <span 
          className="coleta-status"
          style={{ backgroundColor: getStatusColor() }}
        >
          {coleta.status.replace('_', ' ')}
        </span>
      </div>

      <div className="coleta-body">
        <p><strong>Quantidade:</strong> {coleta.quantidade} kg</p>
        <p><strong>Endereço:</strong> {coleta.endereco}</p>
        
        {coleta.observacoes && (
          <p className="coleta-obs">
            <strong>Observações:</strong> {coleta.observacoes}
          </p>
        )}

        {coleta.imagem && (
          <div className="coleta-imagem">
            <img 
              src={coleta.imagem} 
              alt={`Resíduo de ${coleta.tipoMaterial}`} 
            />
          </div>
        )}
      </div>

      <div className="coleta-actions">
        {role === 'coletor' && coleta.status === 'pendente' && (
          <button 
            className="btn-aceitar"
            onClick={() => onAccept(coleta._id)}
          >
            Aceitar Coleta
          </button>
        )}

        {role === 'empresa' && (
          <>
            {coleta.status === 'pendente' && (
              <button 
                className="btn-editar"
                onClick={() => onEdit(coleta)}
              >
                Editar
              </button>
            )}
            <button 
              className="btn-cancelar"
              onClick={() => onCancel(coleta._id)}
              disabled={coleta.status === 'concluída'}
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ColetaCard;