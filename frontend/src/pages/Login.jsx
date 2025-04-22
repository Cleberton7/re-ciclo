import React, { useState } from "react";
import "./styles/login.css";
import Logo from "../assets/logo.png";
import { loginUser } from "../../../backend/src/services/authService";

const Login = ({ onLoginSuccess }) => {
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(""); // Estado para exibir erros

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await loginUser({ email, senha });
      
      console.log("Resposta completa do backend:", response); // Log completo
      
      if (!response.nome) {
        console.warn("Atenção: nome não veio do backend");
        response.nome = 'Usuário'; // Fallback seguro
      }
  
      localStorage.setItem("token", response.token);
      localStorage.setItem("nome", response.nome);
      localStorage.setItem("role", response.tipoUsuario);
  
      console.log("Dados salvos no localStorage:", {
        nome: response.nome,
        role: response.tipoUsuario
      });
  
      onLoginSuccess(response.nome, response.tipoUsuario);
    } catch (err) {
      setError("Erro ao fazer login: " + (err.response?.data?.error || err.message));
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
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {error && <div className="error-message">{error}</div>}
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
            <button className="close-button" onClick={() => setShowRecoverModal(false)}>×</button>
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
