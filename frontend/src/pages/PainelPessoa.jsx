import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/painelPessoa.css";
import "./styles/containerPrincipal.css"

const PainelPessoa = () => {
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    cpf: "",
    endereco: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        console.log('Enviando token:', token.substring(0, 20) + '...');
        
        const response = await axios.get('http://localhost:5000/api/usuarios/pessoal', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.data?.success) {
          throw new Error(response.data.message || 'Resposta inválida do servidor');
        }

        setUserData({
          nome: response.data.data.nome || "",
          email: response.data.data.email || "",
          cpf: response.data.data.cpf || "",
          endereco: response.data.data.endereco || ""
        });

      } catch (error) {
        console.error('Erro completo:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setMessage(error.response?.data?.message || "Erro ao carregar dados");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    
    try {
      if (!userData.nome || !userData.cpf) {
        throw new Error("Nome e CPF são obrigatórios");
      }

      const response = await axios.put(
        "http://localhost:5000/api/usuario/dados",
        { ...userData, tipoUsuario: "pessoa" },
        {
          headers: { 
            'Authorization': `Bearer ${token.trim()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setUserData(response.data);
      setMessage("Dados atualizados com sucesso!");
      setIsEditing(false);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="painel-container" id="containerPrincipal"x>
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