import React, { useState } from "react";
import "./styles/register.css";
import { registerUser } from "../../../backend/src/services/authService";

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
    tipoUsuario: "empresa", // ou "pessoa"
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    setFormData((prev) => ({ ...prev, tipoUsuario: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validação para "pessoa"
    if (userType === "pessoa") {
      if (!formData.nome || !formData.email || !formData.senha || !formData.cpf || !formData.endereco) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
    }
  
    // Validação para "empresa"
    if (userType === "empresa") {
      if (!formData.nomeFantasia || !formData.cnpj || !formData.tipoEmpresa || !formData.email || !formData.senha || !formData.endereco) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
    }
  
    try {
      const dataToSend = { ...formData, tipoUsuario: userType };
      const response = await registerUser(dataToSend);
      alert("Usuário registrado com sucesso!");
      console.log(response);
    } catch (error) {
      alert("Erro ao registrar: " + error.response?.data?.mensagem || error.message);
    }
  };
  

  return (
    <div className="containerRegister">
      <h2>Registro</h2>

      <form onSubmit={handleSubmit}>
        <label>Tipo de Usuário:</label>
        <select
          name="userType"
          value={userType}
          onChange={handleUserTypeChange}
        >
          <option value="pessoa">Pessoa Física</option>
          <option value="empresa">Empresa / Coletor</option>
        </select>

        {userType === "pessoa" ? (
          <div>
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
          </div>
        ) : (
          <div>
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
          </div>
        )}

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
