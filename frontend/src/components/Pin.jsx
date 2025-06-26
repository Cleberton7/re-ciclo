import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaRecycle, FaBuilding } from 'react-icons/fa';
import '../pages/styles/pin.css';

const Pin = ({ tipo, nome, endereco, telefone, email, cnpj }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="pin-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <div className={`pin-icon ${tipo}`}>
        {tipo === 'empresa' ? <FaBuilding size={16} /> : <FaRecycle size={16} />}
      </div>

      {showTooltip && (
        <div className="pin-tooltip">
          <div className="tooltip-header">
            <h3>{nome}</h3>
            <div className={`tipo-badge ${tipo}`}>
              {tipo === 'empresa' ? 'Empresa' : 'Centro de Reciclagem'}
            </div>
          </div>
          
          <div className="tooltip-content">
            {email && (
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <span>{email}</span>
              </div>
            )}
            
            {telefone && (
              <div className="info-item">
                <FaPhone className="info-icon" />
                <span>{telefone}</span>
              </div>
            )}
            
            {endereco && (
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <span>{endereco}</span>
              </div>
            )}
            
            {cnpj && (
              <div className="info-item">
                <FaIdCard className="info-icon" />
                <span>{cnpj}</span>
              </div>
            )}
          </div>
          
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default Pin;