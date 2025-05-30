import React, { useState } from "react";
import "./styles/login.css";
import Logo from "../assets/logo.png";
import { loginUser } from "../services/authService";
import useAuth from "../contexts/authFunctions";

const Login = ({ onLoginSuccess, onRegisterClick }) => {
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !senha) {
      setError("Por favor, preencha todos os campos");
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser({ email, senha });
      console.log('Resposta completa da API:', response);
      console.log('Dados do usuário recebidos:', response.usuario);


      if (!response?.token || !response?.usuario) {
        throw new Error("Resposta do servidor incompleta");
      }

  

      // Chama o contexto para atualizar o estado global
      login(response.usuario, response.token);
      // Callback de sucesso
      onLoginSuccess();

    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
    
  };
  

  return (
    <div className="login-modal-content">
      <div className="login-left">
        <div className="logo-placeholder">
          <img src={Logo} alt="Logo da empresa" className="logo-img" />
        </div>
      </div>

      <div className="login-right">
        <div id="text-login">
          <h2>Login</h2>
        </div>

        <div id="form-login">
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength="6"
            />

            {error && (
              <div className="error-message">
                {error}
                {error.includes('incorretos') && (
                  <div className="recover-link">
                    <a onClick={() => setShowRecoverModal(true)}>Esqueceu sua senha?</a>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <div className="forgot-password">
          <a onClick={() => setShowRecoverModal(true)}>Esqueci minha senha</a>
        </div>

        <div className="register-link">
          Não tem uma conta? <span onClick={onRegisterClick}>Cadastre-se</span>
        </div>
      </div>

      {showRecoverModal && (
        <div className="modal-overlay" onClick={() => setShowRecoverModal(false)}>
          <div className="modal-recover" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-button" 
              onClick={() => setShowRecoverModal(false)}
              aria-label="Fechar modal"
            >
              ×
            </button>
            <h3>Recuperar Senha</h3>
            <p>Digite seu e-mail para receber o link de recuperação</p>
            <input 
              type="email" 
              placeholder="Digite seu e-mail" 
              required
            />
            <div className="modal-buttons">
              <button>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
