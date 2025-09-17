import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaRecycle, FaBuilding } from 'react-icons/fa';
import '../pages/styles/pin.css';

const Pin = ({
  tipo,
  nome,
  endereco,
  telefone,
  email,
  cnpj,
  recebeResiduoComunidade,
  tiposMateriais,
  mapContainerRef
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const pinRef = useRef();
  const tooltipRef = useRef();

  const pinClass = `pin-icon ${tipo} ${recebeResiduoComunidade ? 'recebe' : ''}`;
  const badgeClass = `tipo-badge ${tipo} ${recebeResiduoComunidade ? 'recebe' : ''}`;
  const mostrarTiposMateriais =
    (tipo === 'empresa' && recebeResiduoComunidade) ||
    tipo === 'centro';

  const abrirRota = () => {
    if (endereco) {
      const enderecoEncoded = encodeURIComponent(endereco);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${enderecoEncoded}`, '_blank');
    }
  };

  // Fechar tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) && 
          pinRef.current && !pinRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showTooltip]);

  // Atualizar posição do tooltip
  useEffect(() => {
    if (!showTooltip || !pinRef.current) return;

    const updateTooltipPosition = () => {
      const rect = pinRef.current.getBoundingClientRect();
      
      // Posicionar sempre acima do pin
      const top = rect.top - 10;
      const left = rect.left + rect.width / 2;
      
      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translate(-50%, -100%)'
      });
    };

    updateTooltipPosition();
    
    // Atualizar quando a janela for redimensionada
    window.addEventListener('resize', updateTooltipPosition);
    
    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, [showTooltip]);

  return (
    <div
      className={`pin-container ${showTooltip ? 'active' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => {
        e.stopPropagation();
        setShowTooltip(!showTooltip);
      }}
      ref={pinRef}
    >
      <div className={pinClass}>
        {tipo === 'empresa' ? <FaBuilding size={16} /> : <FaRecycle size={16} />}
      </div>

      {showTooltip &&
        createPortal(
          <div
            className="pin-tooltip"
            style={tooltipStyle}
            ref={tooltipRef}
          >
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

              {tipo === 'empresa' && recebeResiduoComunidade && (
                <div className="info-item recebe-residuo">
                  <FaRecycle className="info-icon" />
                  <span>Esta empresa aceita resíduos da comunidade</span>
                </div>
              )}

              {mostrarTiposMateriais && tiposMateriais && tiposMateriais.length > 0 && (
                <div className="pin-materiais-section">
                  <div className="pin-materiais-header">
                    <FaRecycle className="pin-materiais-icon" />
                    <span className="pin-materiais-title">Materiais Aceitos:</span>
                  </div>
                  <div className="pin-materiais-list">
                    {tiposMateriais.slice(0, 3).map((material, index) => (
                      <span key={index} className="pin-material-tag">
                        {material}
                      </span>
                    ))}
                    {tiposMateriais.length > 3 && (
                      <span className="pin-material-more">
                        +{tiposMateriais.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="tooltip-arrow"></div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Pin;