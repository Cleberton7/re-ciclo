import React, { useState } from "react";
import "./styles/login.css";
import Logo from "../assets/logo.png";
import { loginUser, requestPasswordReset, resendVerificationEmail } from "../services/authService";
import useAuth from "../hooks/useAuth";
import Modal from "../components/Modal";

const Login = ({ onLoginSuccess, onRegisterClick }) => {
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverMessage, setRecoverMessage] = useState("");
  const [recoverError, setRecoverError] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ email, senha });
      
      if (!response?.token || !response?.usuario) {
        throw new Error("Erro inesperado ao fazer login");
      }
      
      login(response.usuario, response.token);
      onLoginSuccess();
      
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setError(
          <div className="email-not-verified">
            <p>Seu e-mail ainda não foi verificado</p>
            <button 
              onClick={async () => {
                try {
                  await resendVerificationEmail(email);
                  setError("Novo e-mail de verificação enviado com sucesso!");
                } catch (resendError) {
                  setError("Erro ao reenviar e-mail. Tente novamente mais tarde.");
                }
              }}
              className="resend-button"
            >
              Reenviar e-mail de verificação
            </button>
          </div>
        );
      } else {
        setError(
          err.response?.data?.mensagem || 
          err.message || 
          "Erro ao fazer login. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    setRecoverError("");
    setRecoverMessage("");
    setLoading(true);

    try {
      await requestPasswordReset(recoverEmail);
      setRecoverMessage("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
      setRecoverEmail("");
    } catch (err) {
      let errorMessage = "Erro ao solicitar recuperação";
      
      if (err.response) {
        switch (err.response.status) {
          case 403:
            errorMessage = "Ação não permitida para este usuário";
            break;
          case 404:
            errorMessage = "E-mail não encontrado";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      }
      
      setRecoverError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={Logo} alt="Logo da empresa" className="login-logo-img" />
      </div>

      <div className="login-right">
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            className="login-input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength="6"
          />

          {error && (
            <div className="login-error-message">
              {error}
              {typeof error === 'string' && error.includes('incorretos') && (
                <div className="login-recover-link">
                  <button 
                    type="button" 
                    className="login-recover-link-button"
                    onClick={() => setShowRecoverModal(true)}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            className="login-submit-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-forgot-password">
          <a
            className="login-forgot-password-link"
            onClick={() => setShowRecoverModal(true)}
          >
            Esqueci minha senha
          </a>
        </div>

        <div className="login-register-link">
          Não tem uma conta?{' '}
          <span
            className="login-register-link-text"
            onClick={onRegisterClick}
          >
            Cadastre-se
          </span>
        </div>
      </div>

      <Modal isOpen={showRecoverModal} onClose={() => setShowRecoverModal(false)} size="small">
        <div className="login-recover-content">
          <h3 className="login-recover-title">Recuperar Senha</h3>
          <p className="login-recover-description">
            Digite seu e-mail para receber o link de recuperação
          </p>
          
          {recoverMessage && (
            <div className="login-success-message">{recoverMessage}</div>
          )}
          {recoverError && (
            <div className="login-error-message">{recoverError}</div>
          )}
          
          <form className="login-recover-form" onSubmit={handleRecoverPassword}>
            <input 
              className="login-recover-input"
              type="email" 
              placeholder="Digite seu e-mail" 
              value={recoverEmail}
              onChange={(e) => setRecoverEmail(e.target.value)}
              required
            />
            <button 
              className="login-recover-submit-button"
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Login;