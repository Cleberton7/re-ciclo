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
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      // Mapeamento de endpoints atualizado
      const endpoint = {
        empresa: 'empresas-parceiras/dados', // Agora bate com o backend
        pessoa: 'usuario/dados',
        coletor: 'coletor/dados'
      }[tipoUsuario];


      if (!endpoint) {
        setError(`Tipo de usuário não suportado: ${tipoUsuario}`);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Validação mais robusta dos dados recebidos
        if (!response.data) {
          throw new Error("Nenhum dado recebido do servidor");
        }

        const dadosRecebidos = response.data.data || response.data;
        
        if (!dadosRecebidos?.nome) {
          throw new Error("Estrutura de dados inválida: campo 'nome' não encontrado");
        }

        // Normalização dos dados
        const dadosFormatados = {
          ...dadosRecebidos,
          documento: tipoUsuario === "empresa" 
            ? dadosRecebidos.cnpj || 'Não informado'
            : dadosRecebidos.cpf || 'Não informado',
          email: dadosRecebidos.email || 'Não informado'
        };

        setDados(dadosFormatados);
        
      } catch (err) {
        console.error("Erro na requisição:", err);
        
        // Tratamento de erro mais detalhado
        let errorMessage = "Erro ao carregar dados";
        
        if (err.response) {
          if (err.response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          errorMessage = err.response.data?.message || 
                        `Erro ${err.response.status}: ${err.response.statusText}`;
        } else if (err.request) {
          errorMessage = "Sem resposta do servidor - verifique sua conexão";
        } else {
          errorMessage = err.message || "Erro desconhecido";
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, tipoUsuario]);

  if (loading) return <div className="loading">Carregando dados...</div>;
  
  if (error) return (
    <div className="error">
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Tentar novamente</button>
    </div>
  );

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
            {tipoUsuario === "empresa" && dados.tipoEmpresa && (
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
        <div className="error">Nenhum dado encontrado para este usuário</div>
      )}
    </div>
  );
};

export default PainelGenerico;