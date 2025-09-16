import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getEmpresasPublicas, getCentrosReciclagemPublicos } from '../services/publicDataServices.js';
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaRecycle, FaSearch, FaTrash } from 'react-icons/fa';
import { BASE_URL } from '../config/config.js';
import FiltroMapa from '../components/FiltroMapa';
import Modal from '../components/Modal';
import Login from '../pages/Login';
import Register from '../pages/Register';
import "./styles/containerPrincipal.css";
import "./styles/dashboardEmpresa.css";

const TIPOS_MATERIAIS_OPTIONS = [
  'Telefonia e Acessórios',
  'Informática',
  'Eletrodoméstico',
  'Pilhas e Baterias',
  'Outros Eletroeletrônicos'
];

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [centrosReciclagem, setCentrosReciclagem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    materiais: []
  });
  const [activeModal, setActiveModal] = useState(null);

  // Funções para controlar os modais
  const openModal = (type) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const switchToLogin = () => setActiveModal('login');
  const switchToRegister = () => setActiveModal('register');

  const handleLoginSuccess = () => {
    closeModal();
    window.location.reload();
  };

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
              : null,
            recebeResiduoComunidade: empresa.recebeResiduoComunidade || false,
            tiposMateriais: empresa.tiposMateriais || []
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
              : null,
            tiposMateriais: centro.tiposMateriais || []
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
    const lowerSearch = searchTerm.toLowerCase();

    const filtraMateriais = (item) => {
      if (filtros.materiais.length === 0) return true;
      return filtros.materiais.some(m => item.tiposMateriais.includes(m));
    };

    const filtraTipo = (item, tipoItem) => {
      if (filtros.tipo === 'todos') return true;
      return filtros.tipo === tipoItem;
    };

    return {
      empresas: empresas.filter(e => 
        (e.nomeExibido.toLowerCase().includes(lowerSearch) ||
        e.email.toLowerCase().includes(lowerSearch) ||
        e.endereco.toLowerCase().includes(lowerSearch) ||
        e.cnpj.toLowerCase().includes(lowerSearch) ||
        e.tiposMateriais.some(m => m.toLowerCase().includes(lowerSearch)))
        && filtraMateriais(e) && filtraTipo(e, 'empresa')
      ),
      centrosReciclagem: centrosReciclagem.filter(c => 
        (c.nomeExibido.toLowerCase().includes(lowerSearch) ||
        c.email.toLowerCase().includes(lowerSearch) ||
        c.endereco.toLowerCase().includes(lowerSearch) ||
        c.cnpj.toLowerCase().includes(lowerSearch) ||
        c.tiposMateriais.some(m => m.toLowerCase().includes(lowerSearch)))
        && filtraMateriais(c) && filtraTipo(c, 'centro')
      )
    };
  }, [empresas, centrosReciclagem, searchTerm, filtros]);

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
      {/* Seção de Chamada para Empresas */}
      <section className="partners-section">
        <div className="partners-container">
          <div className="partners-content">
            <h2>Para empresas e centros de reciclagem</h2>
            <p>Faça parte da nossa rede de parceiros e amplie seu impacto</p>
            
            <div className="partner-cta">
              <h3>Seja uma empresa parceira</h3>
              <p>Junte-se à nossa plataforma e conecte-se com milhares de pessoas que querem reciclar</p>
              <button 
                className="btn btn-primary" 
                onClick={() => openModal("register")}
              >
                Acessar Área Restrita
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="empresas-content-wrapper">
        {/* Barra de busca e filtro - AGORA EM LINHA */}
        <div className="empresas-search-filter-container">
          <div className="empresas-search-input-wrapper modern-search">
            <FaSearch className="empresas-search-icon" />
            <input
              type="text"
              placeholder="Buscar empresas, centros de reciclagem ou tipos de materiais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="empresas-search-input modern-search-input"
            />
            <div className="search-underline"></div> 
          </div>
          
          <div className="filtro-mapa-container">
            <FiltroMapa
              filtros={filtros}
              onFiltroChange={setFiltros}
              tiposMateriaisOptions={TIPOS_MATERIAIS_OPTIONS}
            />
          </div>
        </div>

        <div className="empresas-section">
          <h2><FaBuilding className="empresas-section-icon" />Empresas Parceiras</h2>
          {filteredData.empresas.length === 0 ? (
            <p className="empresas-no-results">Nenhuma empresa encontrada com os filtros aplicados</p>
          ) : (
            <div className="empresas-cards-container">
              {filteredData.empresas.map(empresa => (
                <Link to={`/empresas/${empresa.id}`} key={empresa.id} className="empresas-card-link">
                  <div 
                    className="empresas-card"
                    style={{ 
                      backgroundImage: empresa.imagemUrl 
                        ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${empresa.imagemUrl})`
                        : 'none',
                      backgroundColor: !empresa.imagemUrl ? '#009951' : 'transparent'
                    }}
                  >
                    <div className="empresas-card-content">
                      <h3>{empresa.nomeExibido}</h3>
                      
                      {empresa.recebeResiduoComunidade && empresa.tiposMateriais && empresa.tiposMateriais.length > 0 && (
                        <div className="empresas-materiais-section">
                          <div className="empresas-materiais-label">
                            <FaRecycle className="empresas-info-icon" />
                            <span>Materiais aceitos:</span>
                          </div>
                          <div className="empresas-materiais-list">
                            {empresa.tiposMateriais.slice(0, 3).map((material, index) => (
                              <span key={index} className="empresas-material-tag">
                                {material}
                              </span>
                            ))}
                            {empresa.tiposMateriais.length > 3 && (
                              <span className="empresas-material-more">
                                +{empresa.tiposMateriais.length - 3} mais
                              </span>
                            )}
                          </div>
                        </div>
                      )}

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
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="empresas-section">
          <h2><FaRecycle className="empresas-section-icon" /> Centros de Coleta</h2>
          {filteredData.centrosReciclagem.length === 0 ? (
            <p className="empresas-no-results">Nenhum centro de reciclagem encontrado com os filtros aplicados</p>
          ) : (
            <div className="empresas-cards-container">
              {filteredData.centrosReciclagem.map(centro => (
                <Link to={`/centros/${centro.id}`} key={centro.id} className="empresas-card-link">
                  <div 
                    className="empresas-card"
                    style={{ 
                      backgroundImage: centro.imagemUrl 
                        ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${centro.imagemUrl})`
                        : 'none',
                      backgroundColor: !centro.imagemUrl ? '#009951' : 'transparent',
                    }}
                  >
                    <div className="empresas-card-overlay"></div>
                    <div className="empresas-card-content">
                      <h3>{centro.nomeExibido}</h3>

                      {centro.tiposMateriais && centro.tiposMateriais.length > 0 && (
                        <div className="empresas-materiais-section">
                          <div className="empresas-materiais-label">
                            <FaRecycle className="empresas-info-icon" />
                            <span>Materiais aceitos:</span>
                          </div>
                          <div className="empresas-materiais-list">
                            {centro.tiposMateriais.slice(0, 3).map((material, index) => (
                              <span key={index} className="empresas-material-tag">
                                {material}
                              </span>
                            ))}
                            {centro.tiposMateriais.length > 3 && (
                              <span className="empresas-material-more">
                                +{centro.tiposMateriais.length - 3} mais
                              </span>
                            )}
                          </div>
                        </div>
                      )}

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
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modais de Login e Registro */}
      <Modal isOpen={activeModal !== null} onClose={closeModal} size="medium">
        {activeModal === 'login' ? (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onRegisterClick={switchToRegister} 
          />
        ) : (
          <Register onLoginClick={switchToLogin} />
        )}
      </Modal>
    </div>
  );
};

export default Empresas;