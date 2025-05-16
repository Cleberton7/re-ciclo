// Empresas.jsx
import React, { useEffect, useState } from 'react';
import { getEmpresasPublicas, getColetoresPublicos } from '../services/publicDataServices.js';
import "./styles/containerPrincipal.css";
import "./styles/dashboardEmpresa.css";

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [coletores, setColetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresasData, coletoresData] = await Promise.all([
          getEmpresasPublicas(),
          getColetoresPublicos()
        ]);
        
        setEmpresas(empresasData);
        setColetores(coletoresData);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar dados públicos", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className='containerEmpresas' id="containerPrincipal">
      <h1>Bem-vindo à tela de empresas</h1>

      <div className="secao">
        <h2>Empresas Parceiras</h2>
        <div className="cardsContainer">
          {empresas.map(empresa => (
            <div key={empresa._id} className="cardEmpresa">
              <h3>{empresa.nomeFantasia || empresa.nome}</h3>
              <p>Email: {empresa.email}</p>
              <p>Endereço: {empresa.endereco}</p>
              <p>CNPJ: {empresa.cnpj}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="secao">
        <h2>Centros de coletas Disponíveis</h2>
        <div className="cardsContainer">
          {coletores.map(coletor => (
            <div key={coletor._id} className="cardEmpresa">
              <h3>{coletor.nome}</h3>
              <p>Email: {coletor.email}</p>
              <p>Telefone: {coletor.telefone}</p>
              <p>Veículo: {coletor.veiculo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Empresas;