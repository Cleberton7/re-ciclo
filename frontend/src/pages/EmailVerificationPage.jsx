import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../services/authService';
import './styles/emailVerification.css';
import Logo from '../assets/logo.png';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Verificando seu e-mail...');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token de verificação não encontrado');
        setShowResend(true);
        return;
      }

      try {
        await verifyEmail(token);
        setMessage('E-mail verificado com sucesso! Redirecionando para login...');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError(err.response?.data?.mensagem || 'Falha ao verificar e-mail');
        setShowResend(true);
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe seu e-mail');
      return;
    }

    setResendLoading(true);
    setError('');
    try {
      await resendVerificationEmail(email);
      setResendSuccess('E-mail de verificação reenviado. Verifique sua caixa de entrada.');
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao reenviar e-mail de verificação');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <img src={Logo} alt="Logo" className="logo" />
        <h2>Verificação de E-mail</h2>
        
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="success-message">{message}</div>
        )}
        
        {showResend && (
          <div className="resend-section">
            <p>Não recebeu o e-mail de verificação?</p>
            {resendSuccess && <div className="success-message">{resendSuccess}</div>}
            <form onSubmit={handleResend}>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={resendLoading}>
                {resendLoading ? 'Enviando...' : 'Reenviar E-mail'}
              </button>
            </form>
          </div>
        )}
        
        <button onClick={() => navigate('/login')}>Voltar para login</button>
      </div>
    </div>
  );
};

export default EmailVerificationPage;