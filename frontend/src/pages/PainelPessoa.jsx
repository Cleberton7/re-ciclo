import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/painelPessoa.css";

const PainelPessoa = () => {
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    cpf: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Token não encontrado");
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:5000/api/usuario/pessoal', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        // Redirecionar para login se o token for inválido
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");  // Garantir que o token é recuperado aqui também
    try {
      await axios.put("http://localhost:5000/api/usuario/pessoal", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
      setMessage("Dados atualizados com sucesso!");
    } catch (error) {
      setMessage("Erro ao atualizar os dados.");
      console.error(error);
    }
  };

  return (
    <div className="painel-container">
      <h2>Meu Perfil</h2>
      {message && <p className="message">{message}</p>}
      <div className="info-group">
        <label>Nome:</label>
        <input
          type="text"
          name="nome"
          value={userData.nome}
          onChange={handleChange}
          disabled={!isEditing}
        />
      </div>
      <div className="info-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          disabled={!isEditing}
        />
      </div>
      <div className="info-group">
        <label>CPF:</label>
        <input
          type="text"
          name="cpf"
          value={userData.cpf}
          onChange={handleChange}
          disabled
        />
      </div>
      <div className="button-group">
        {isEditing ? (
          <button onClick={handleSave}>Salvar</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>Editar</button>
        )}
      </div>
    </div>
  );
};

export default PainelPessoa;
