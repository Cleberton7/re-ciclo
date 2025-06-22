import React, { useEffect, useState } from 'react';
import { getEmpresasPublicas, getCentrosReciclagemPublicos } from '../services/publicDataServices.js';
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaRecycle } from 'react-icons/fa';
import "./styles/containerPrincipal.css";
import "./styles/dashboardEmpresa.css";

// ✅ URL dinâmica: funciona local e produção
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [centrosReciclagem, setCentrosReciclagem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresasData, centrosReciclagemData] = await Promise.all([
          getEmpresasPublicas(),
          getCentrosReciclagemPublicos()
        ]);

        const empresasFormatadas = empresasData.map(empresa => ({
          id: empresa._id,
          nomeExibido: empresa.nomeFantasia || empresa.razaoSocial || "Empresa",
          email: empresa.email || "Não informado",
          telefone: empresa.telefone || "Não informado",
          cnpj: empresa.cnpj ? formatarCNPJ(empresa.cnpj) : "Não informado",
          endereco: empresa.endereco || "Endereço não informado",
          imagemUrl: empresa.imagemPerfil 
            ? `${API_URL}/uploads/${empresa.imagemPerfil}`
            : null
        }));

        const centrosReciclagemFormatados = centrosReciclagemData.map(centroReciclagem => ({
          id: centroReciclagem._id,
          nomeExibido: centroReciclagem.nomeFantasia || centroReciclagem.nome || "Centro de Reciclagem",
          email: centroReciclagem.email || "Não informado",
          telefone: centroReciclagem.telefone ? formatarTelefone(centroReciclagem.telefone) : "Não informado",
          cnpj: centroReciclagem.cnpj ? formatarCNPJ(centroReciclagem.cnpj) : "Não informado",
          endereco: centroReciclagem.endereco || "Endereço não informado",
          imagemUrl: centroReciclagem.imagemPerfil 
            ? `${API_URL}/uploads/${centroReciclagem.imagemPerfil}`
            : null
        }));

        setEmpresas(empresasFormatadas);
        setCentrosReciclagem(centrosReciclagemFormatados);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar dados públicos", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatarCNPJ = (cnpj) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

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
                    ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${empresa.imagemUrl})`
                    : 'none',
                  backgroundColor: !empresa.imagemUrl ? '#009951' : 'transparent'
                }}
              >
                <div className="card-content">
                  <h3>{empresa.nomeExibido}</h3>
                  <div className="info-item"><FaEnvelope className="info-icon" /><span>{empresa.email}</span></div>
                  <div className="info-item"><FaPhone className="info-icon" /><span>{empresa.telefone}</span></div>
                  <div className="info-item"><FaMapMarkerAlt className="info-icon" /><span>{empresa.endereco}</span></div>
                  <div className="info-item"><FaIdCard className="info-icon" /><span>{empresa.cnpj}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="secao">
          <h2><FaRecycle className="section-icon" /> Centros de Coleta</h2>
          <div className="cardsContainer">
            {centrosReciclagem.map(centro => (
              <div 
                key={centro.id} 
                className="cardEmpresa"
                style={{ 
                  backgroundImage: centro.imagemUrl 
                    ? `url(${centro.imagemUrl})`
                    : 'none',
                  backgroundColor: !centro.imagemUrl ? '#009951' : 'transparent'
                }}
              >
                <div className="card-overlay"></div>
                <div className="card-content">
                  <h3>{centro.nomeExibido}</h3>
                  <div className="info-item"><FaEnvelope className="info-icon" /><span>{centro.email}</span></div>
                  <div className="info-item"><FaPhone className="info-icon" /><span>{centro.telefone}</span></div>
                  <div className="info-item"><FaMapMarkerAlt className="info-icon" /><span>{centro.endereco}</span></div>
                  <div className="info-item"><FaIdCard className="info-icon" /><span>{centro.cnpj}</span></div>
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
