import React, { useState } from "react";
import "./styles/register.css";

const Register = () => {
  const [userType, setUserType] = useState("empresa");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    endereco: "",
    nomeFantasia: "",
    cnpj: "",
    tipoEmpresa: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", formData);
    // aqui você envia pro backend ou faz o que quiser
  };

  return (
    <div className="containerRegister">
      <h2>Registro</h2>

      <form onSubmit={handleSubmit}>
        <label>Tipo de Usuário:</label>
        <select
          name="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="pessoa">Pessoa Física</option>
          <option value="empresa">Empresa / Coletor</option>
        </select>

        {userType === "pessoa" ? (
          <>
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
            />
            <input
              type="text"
              name="cpf"
              placeholder="CPF"
              value={formData.cpf}
              onChange={handleChange}
            />
            <input
              type="text"
              name="endereco"
              placeholder="Endereço"
              value={formData.endereco}
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <input
              type="text"
              name="nomeFantasia"
              placeholder="Nome Fantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
            />
            <input
              type="text"
              name="cnpj"
              placeholder="CNPJ"
              value={formData.cnpj}
              onChange={handleChange}
            />
            <input
              type="text"
              name="endereco"
              placeholder="Endereço"
              value={formData.endereco}
              onChange={handleChange}
            />
            <select
              name="tipoEmpresa"
              value={formData.tipoEmpresa}
              onChange={handleChange}
            >
              <option value="">Selecione o tipo</option>
              <option value="empresa">Empresa</option>
              <option value="coletor">Coletor</option>
            </select>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
            />
          </>
        )}

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
