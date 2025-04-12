import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/login.css";
import Logo from "../assets/logo.png";
import LogoCapa from "../assets/logoCapa.png";

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [showRecoverModal, setShowRecoverModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Lógica de login (após sucesso)
    onLoginSuccess(); // Chama o callback para notificar que o login foi bem-sucedido
    navigate("/painel"); // Redireciona para a página principal (ajuste a rota se necessário)
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
            <input type="text" placeholder="Usuário" />
            <input type="password" placeholder="Senha" />
            <button type="submit">Entrar</button>
          </form>
        </div>

        <div className="forgot-password">
          <a onClick={() => setShowRecoverModal(true)}>Esqueci minha senha</a>
        </div>
      </div>

      {showRecoverModal && (
        <div className="modal-overlay" onClick={() => setShowRecoverModal(false)}>
          <div className="modal-recover" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowRecoverModal(false)}>
              ×
            </button>
            <h3>Recuperar Senha</h3>
            <input type="email" placeholder="Digite seu e-mail" />
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
