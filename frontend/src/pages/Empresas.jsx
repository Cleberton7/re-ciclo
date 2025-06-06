import React, { useEffect, useState } from 'react';
import { getEmpresasPublicas, getColetoresPublicos } from '../services/publicDataServices.js';
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaRecycle } from 'react-icons/fa';
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

        // Formatação dos dados das empresas
        const empresasFormatadas = empresasData.map(empresa => ({
          id: empresa._id,
          nomeExibido: empresa.nomeFantasia || empresa.razaoSocial || "Empresa",
          email: empresa.email || "Não informado",
          telefone: empresa.telefone || "Não informado",
          cnpj: empresa.cnpj ? formatarCNPJ(empresa.cnpj) : "Não informado",
          endereco: empresa.endereco || "Endereço não informado",
          imagemUrl: empresa.imagemPerfil 
            ? `http://localhost:5000/uploads/${empresa.imagemPerfil}`
            : null
        }));

        // Formatação dos dados dos coletores
        const coletoresFormatados = coletoresData.map(coletor => ({
          id: coletor._id,
          nomeExibido: coletor.nomeFantasia || coletor.nome || "Coletor",
          email: coletor.email || "Não informado",
          telefone: coletor.telefone ? formatarTelefone(coletor.telefone) : "Não informado",
          cnpj: coletor.cnpj ? formatarCNPJ(coletor.cnpj) : "Não informado",
          endereco: coletor.endereco || "Endereço não informado",
          imagemUrl: coletor.imagemPerfil 
            ? `http://localhost:5000/uploads/${coletor.imagemPerfil}`
            : null
        }));

        setEmpresas(empresasFormatadas);
        setColetores(coletoresFormatados);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar dados públicos", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Função para formatar CNPJ
  const formatarCNPJ = (cnpj) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  // Função para formatar telefone
  const formatarTelefone = (telefone) => {
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }
    return telefone;
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Carregando informações...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <p>Erro ao carregar dados: {error}</p>
      <button onClick={() => window.location.reload()} className="reload-button">
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div className='containerEmpresas' id="containerPrincipal">
      <div className="content-wrapper">
        <div className="secao">
          <h2><FaBuilding className="section-icon" />Empresas Parceiras</h2>
          <div className="cardsContainer">
            {empresas.map(empresa => (
              <div 
                key={empresa.id} 
                className="cardEmpresa"
                style={{ 
                  backgroundImage: empresa.imagemUrl 
                    ? `url(${empresa.imagemUrl})`
                    : 'none',
                  backgroundColor: !empresa.imagemUrl ? '#009951' : 'transparent'
                }}
              >
                <div className="card-overlay"></div>
                <div className="card-content">
                  <h3>{empresa.nomeExibido}</h3>
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <span>{empresa.email}</span>
                  </div>
                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <span>{empresa.telefone}</span>
                  </div>
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>{empresa.endereco}</span>
                  </div>
                  <div className="info-item">
                    <FaIdCard className="info-icon" />
                    <span>{empresa.cnpj}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="secao">
          <h2><FaRecycle className="section-icon" /> Centros de Coleta</h2>
          <div className="cardsContainer">
            {coletores.map(coletor => (
              <div 
                key={coletor.id} 
                className="cardEmpresa"
                style={{ 
                  backgroundImage: coletor.imagemUrl 
                    ? `url(${coletor.imagemUrl})`
                    : 'none',
                  backgroundColor: !coletor.imagemUrl ? '#009951' : 'transparent'
                }}
              >
                <div className="card-overlay"></div>
                <div className="card-content">
                  <h3>{coletor.nomeExibido}</h3>
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <span>{coletor.email}</span>
                  </div>
                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <span>{coletor.telefone}</span>
                  </div>
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>{coletor.endereco}</span>
                  </div>
                  <div className="info-item">
                    <FaIdCard className="info-icon" />
                    <span>{coletor.cnpj}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empresas;