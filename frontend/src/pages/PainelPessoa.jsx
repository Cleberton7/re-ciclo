import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/painelPessoa.css";

// Estado inicial completo com valores padrão
const INITIAL_STATE = {
  nome: "",
  email: "",
  cpf: "",
  endereco: ""
};

const PainelPessoa = () => {
  const [userData, setUserData] = useState(INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/usuario/pessoal', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Garante que todos os campos tenham valor mesmo se vierem undefined do backend
        setUserData({
          ...INITIAL_STATE,
          ...response.data,
          nome: response.data.nome || "",
          email: response.data.email || "",
          cpf: response.data.cpf || "",
          endereco: response.data.endereco || ""
        });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        // Mantém os valores padrão em caso de erro
        setUserData(INITIAL_STATE);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5000/usuario/dados", 
        { ...userData, tipoUsuario: "pessoa" },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setIsEditing(false);
      setMessage("Dados atualizados com sucesso!");
    } catch (error) {
      setMessage("Erro ao atualizar os dados.");
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }

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
          disabled={!isEditing}
        />
      </div>
      
      <div className="info-group">
        <label>Endereço:</label>
        <input
          type="text"
          name="endereco"
          value={userData.endereco}
          onChange={handleChange}
          disabled={!isEditing}
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