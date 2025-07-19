import React, { useEffect, useState, useMemo } from 'react';
import { getEmpresasPublicas, getCentrosReciclagemPublicos } from '../services/publicDataServices.js';
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaRecycle, FaSearch } from 'react-icons/fa';
import { BASE_URL } from '../config/config.js';
import "./styles/containerPrincipal.css";
import "./styles/dashboardEmpresa.css";

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [centrosReciclagem, setCentrosReciclagem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresasData, centrosReciclagemData] = await Promise.all([
          getEmpresasPublicas(),
          getCentrosReciclagemPublicos()
        ]);

        // Formatação e ordenação dos dados das empresas
        const empresasFormatadas = empresasData
          .map(empresa => ({
            id: empresa._id,
            nomeExibido: empresa.nomeFantasia || empresa.razaoSocial || "Empresa",
            email: empresa.email || "Não informado",
            telefone: empresa.telefone || "Não informado",
            cnpj: empresa.cnpj ? formatarCNPJ(empresa.cnpj) : "Não informado",
            endereco: empresa.endereco || "Endereço não informado",
            imagemUrl: empresa.imagemPerfil 
              ? `${BASE_URL}/uploads/${empresa.imagemPerfil}`
              : null
          }))
          .sort((a, b) => a.nomeExibido.localeCompare(b.nomeExibido));

        // Formatação e ordenação dos dados dos centros de reciclagem
        const centrosReciclagemFormatados = centrosReciclagemData
          .map(centro => ({
            id: centro._id,
            nomeExibido: centro.nomeFantasia || centro.nome || "Centro de Reciclagem",
            email: centro.email || "Não informado",
            telefone: centro.telefone ? formatarTelefone(centro.telefone) : "Não informado",
            cnpj: centro.cnpj ? formatarCNPJ(centro.cnpj) : "Não informado",
            endereco: centro.endereco || "Endereço não informado",
            imagemUrl: centro.imagemPerfil 
              ? `${BASE_URL}/uploads/${centro.imagemPerfil}`
              : null
          }))
          .sort((a, b) => a.nomeExibido.localeCompare(b.nomeExibido));

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

  // Função para filtrar os dados com base no termo de busca
  const filteredData = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return {
      empresas: empresas.filter(empresa => 
        empresa.nomeExibido.toLowerCase().includes(lowerCaseSearchTerm) ||
        empresa.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        empresa.endereco.toLowerCase().includes(lowerCaseSearchTerm) ||
        empresa.cnpj.toLowerCase().includes(lowerCaseSearchTerm)
      ),
      centrosReciclagem: centrosReciclagem.filter(centro => 
        centro.nomeExibido.toLowerCase().includes(lowerCaseSearchTerm) ||
        centro.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        centro.endereco.toLowerCase().includes(lowerCaseSearchTerm) ||
        centro.cnpj.toLowerCase().includes(lowerCaseSearchTerm)
      )
  }}, [empresas, centrosReciclagem, searchTerm]);

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
    <div className='empresas-container' id="containerPrincipal">
      <div className="empresas-content-wrapper">
        {/* Barra de busca */}
        <div className="empresas-search-container">
          <div className="empresas-search-input-wrapper">
            <FaSearch className="empresas-search-icon" />
            <input
              type="text"
              placeholder="Buscar empresas ou centros de reciclagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="empresas-search-input"
            />
          </div>
        </div>

        <div className="empresas-section">
          <h2><FaBuilding className="empresas-section-icon" />Empresas Parceiras</h2>
          {filteredData.empresas.length === 0 ? (
            <p className="empresas-no-results">Nenhuma empresa encontrada com o termo "{searchTerm}"</p>
          ) : (
            <div className="empresas-cards-container">
              {filteredData.empresas.map(empresa => (
                <div 
                  key={empresa.id} 
                  className="empresas-card"
                  style={{ 
                    backgroundImage: empresa.imagemUrl 
                      ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${empresa.imagemUrl})`
                      : 'none',
                    backgroundColor: !empresa.imagemUrl ? '#009951' : 'transparent'
                  }}
                >
                  <div className="empresas-card-content">
                    <h3>{empresa.nomeExibido}</h3>
                    <div className="empresas-info-item">
                      <FaEnvelope className="empresas-info-icon" />
                      <span>{empresa.email}</span>
                    </div>
                    <div className="empresas-info-item">
                      <FaPhone className="empresas-info-icon" />
                      <span>{empresa.telefone}</span>
                    </div>
                    <div className="empresas-info-item">
                      <FaMapMarkerAlt className="empresas-info-icon" />
                      <span>{empresa.endereco}</span>
                    </div>
                    <div className="empresas-info-item">
                      <FaIdCard className="empresas-info-icon" />
                      <span>{empresa.cnpj}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="empresas-section">
          <h2><FaRecycle className="empresas-section-icon" /> Centros de Coleta</h2>
          {filteredData.centrosReciclagem.length === 0 ? (
            <p className="empresas-no-results">Nenhum centro de reciclagem encontrado com o termo "{searchTerm}"</p>
          ) : (
            <div className="empresas-cards-container">
              {filteredData.centrosReciclagem.map(centro => (
                <div 
                  key={centro.id} 
                  className="empresas-card"
                  style={{ 
                    backgroundImage: centro.imagemUrl 
                      ? `url(${centro.imagemUrl})`
                      : 'none',
                    backgroundColor: !centro.imagemUrl ? '#009951' : 'transparent'
                  }}
                >
                  <div className="empresas-card-overlay"></div>
                  <div className="empresas-card-content">
                    <h3>{centro.nomeExibido}</h3>
                    <div className="empresas-info-item">
                      <FaEnvelope className="empresas-info-icon" />
                      <span>{centro.email}</span>
                    </div>
                    <div className="empresas-info-item">
                      <FaPhone className="empresas-info-icon" />
                      <span>{centro.telefone}</span>
                    </div>
                    <div className="empresas-info-item">
                      <FaMapMarkerAlt className="empresas-info-icon" />
                      <span>{centro.endereco}</span>
                    </div>
                    <div className="empresas-info-item">
                      <FaIdCard className="empresas-info-icon" />
                      <span>{centro.cnpj}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Empresas;