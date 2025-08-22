import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaRecycle, FaBuilding } from 'react-icons/fa';
import '../pages/styles/pin.css';

const Pin = ({ tipo, nome, endereco, telefone, email, cnpj, recebeResiduoComunidade }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Define classes diferentes se recebe resíduos da comunidade
  const pinClass = `pin-icon ${tipo} ${recebeResiduoComunidade ? 'recebe' : ''}`;
  const badgeClass = `tipo-badge ${tipo} ${recebeResiduoComunidade ? 'recebe' : ''}`;

  // Função para abrir rota no Google Maps
  const abrirRota = () => {
    if (endereco) {
      const enderecoEncoded = encodeURIComponent(endereco);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${enderecoEncoded}`, '_blank');
    }
  };

  return (
    <div
      className="pin-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <div className={pinClass}>
        {tipo === 'empresa' ? <FaBuilding size={16} /> : <FaRecycle size={16} />}
      </div>

      {showTooltip && (
        <div className="pin-tooltip">
          <div className="tooltip-header">
            <h3>{nome}</h3>
            <div className={badgeClass}>
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
                <button className="rota-button" onClick={abrirRota}>
                  Obter Rota
                </button>
              </div>
            )}
            
            {cnpj && (
              <div className="info-item">
                <FaIdCard className="info-icon" />
                <span>{cnpj}</span>
              </div>
            )}

            {/* Informação extra para empresas que recebem resíduos */}
            {tipo === 'empresa' && recebeResiduoComunidade && (
              <div className="info-item recebe-residuo">
                <FaRecycle className="info-icon" />
                <span>Esta empresa aceita resíduos da comunidade</span>
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
