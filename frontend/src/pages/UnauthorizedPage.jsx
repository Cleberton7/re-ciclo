import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/UnauthorizedPage.css'; 

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <img 
          src="/images/unauthorized.svg" 
          alt="Acesso não autorizado" 
          className="unauthorized-image"
        />
        
        <h1 className="unauthorized-title">Acesso Restrito</h1>
        <h2 className="unauthorized-subtitle">Você não tem permissão para acessar esta página</h2>
        
        <p className="unauthorized-message">
          O conteúdo que você está tentando acessar requer privilégios específicos. 
          Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
        </p>
        
        <div className="unauthorized-actions">
          <button 
            className="unauthorized-button primary"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
          
          <button 
            className="unauthorized-button secondary"
            onClick={() => navigate('/')}
          >
            Página Inicial
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;