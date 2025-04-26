import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './styles/painelGenerico.css';

const PainelGenerico = ({ tipoUsuario }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/usuario/dados", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.tipoUsuario !== tipoUsuario) {
          throw new Error("Acesso não autorizado para este perfil");
        }
        
        setDados(response.data);
      } catch (err) {
        console.error("Erro detalhado:", err);
        if (err?.response) {
          if (err.response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          } else {
            setError(`Erro ${err.response.status}: ${err.response.data?.message || 'Erro no servidor'}`);
          }
        } else {
          setError("Erro de conexão com o servidor");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, tipoUsuario]);

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="painel-container">
      {dados ? (
        <>
          <h2>Bem-vindo, {dados.nome}</h2>
          <div className="dados-section">
            <h3>Seus Dados</h3>
            <div className="info-row">
              <span>Email:</span>
              <strong>{dados.email}</strong>
            </div>
            <div className="info-row">
              <span>{tipoUsuario === "empresa" ? "CNPJ" : "CPF"}:</span>
              <strong>{dados.documento}</strong>
            </div>
            {tipoUsuario === "empresa" && (
              <div className="info-row">
                <span>Tipo Empresa:</span>
                <strong>{dados.tipoEmpresa}</strong>
              </div>
            )}
            {tipoUsuario === "coletor" && (
              <div className="info-row">
                <span>Veículo:</span>
                <strong>{dados.veiculo || 'Não informado'}</strong>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="error">Nenhum dado encontrado</div>
      )}
    </div>
  );
};

export default PainelGenerico;