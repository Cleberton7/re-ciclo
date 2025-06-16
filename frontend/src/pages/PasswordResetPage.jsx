import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import './styles/passwordReset.css';
import Logo from '../assets/logo.png';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!novaSenha || !confirmarSenha) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (novaSenha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, novaSenha);
      setSuccess('Senha redefinida com sucesso! Redirecionando para login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-card">
          <img src={Logo} alt="Logo" className="logo" />
          <h2>Token inválido</h2>
          <p>O link de redefinição de senha está incompleto.</p>
          <button onClick={() => navigate('/login')}>Voltar para login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <img src={Logo} alt="Logo" className="logo" />
        <h2>Redefinir Senha</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processando...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetPage;