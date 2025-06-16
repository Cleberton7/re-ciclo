import React from 'react';
import useAuth from "../hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import './styles/emailNotVerified.css';
import Logo from '../assets/logo.png';

const EmailNotVerifiedPage = () => {
  const { userData, logout, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const handleResend = async () => {
    try {
      await resendVerificationEmail();
      alert('E-mail de verificação reenviado com sucesso!');
    } catch (err) {
      alert(`Erro ao reenviar e-mail: ${err.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Função para obter o nome de exibição
  const getDisplayName = () => {
    if (!userData) return 'Usuário';
    return userData.nome || userData.razaoSocial || userData.nomeFantasia || userData.email || 'Usuário';
  };

  return (
    <div className="email-not-verified-container">
      <div className="email-not-verified-card">
        <img src={Logo} alt="Logo" className="logo" />
        <h2>E-mail não verificado</h2>
        <p>Olá {getDisplayName()},</p>
        <p>Seu endereço de e-mail ainda não foi verificado.</p>
        <p>Por favor, verifique sua caixa de entrada e clique no link de verificação.</p>
        
        <div className="buttons">
          <button onClick={handleResend}>Reenviar E-mail de Verificação</button>
          <button onClick={handleLogout} className="logout">Sair</button>
        </div>
      </div>
    </div>
  );
};

export default EmailNotVerifiedPage;