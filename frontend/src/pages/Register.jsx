import React from "react";

const Register = () => {
  return (
    <div>
      <h2>Registrar</h2>
      <form>
        <input type="text" placeholder="Nome" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Senha" />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
