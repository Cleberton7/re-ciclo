import React from "react";
import "./styles/login.css"

const Login = () => {
  return (
    <div className="containerlogin">
      <h2>Login</h2>
      <form>
        <input type="text" placeholder="Usuário" />
        <input type="password" placeholder="Senha" />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
