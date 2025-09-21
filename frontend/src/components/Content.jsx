import React, { useEffect, useState, useMemo } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getPontosPorProximidade } from '../services/publicDataServices';
import usePublicColetasData from '../hooks/usePublicColetasData';
import RankingEmpresas from '../components/GraficoColetas/RankingEmpresas';
import Pin from '../components/Pin';
import CarrosselGraficos from '../components/GraficoColetas/CarrosselGraficos';
import FiltroMapa from '../components/FiltroMapa';
import "../pages/styles/content.css";

const center = { lat: -3.7657, lng: -49.6725 };

// Opções de tipos de materiais
const TIPOS_MATERIAIS_OPTIONS = [
  'Telefonia e Acessórios',
  'Informática',
  'Eletrodoméstico',
  'Pilhas e Baterias',
  'Outros Eletroeletrônicos'
];

const Content = () => {
  const [marcadores, setMarcadores] = useState([]);
  const [marcadoresOriginais, setMarcadoresOriginais] = useState([]);
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    materiais: []
  });
  const [raioDistancia, setRaioDistancia] = useState(10);
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [carregandoMarcadores, setCarregandoMarcadores] = useState(false); // ✅ Estado corrigido

  const filters = useMemo(() => ({ periodo: "total" }), []);

  const {
    ranking,
    distribuicao,
    estatisticas,
    evolucao,
    loading,
    error,
  } = usePublicColetasData(filters);

  // Obter localização do usuário
// Obter localização do usuário
useEffect(() => {
  // ✅ COORDENADAS FIXAS PARA DESENVOLVIMENTO
  const coordenadasFixas = { 
    lat: -3.7657, 
    lng: -49.6725 
  };
  setLocalizacaoUsuario(coordenadasFixas);
  setCarregandoLocalizacao(false);
  /*
  if ("geolocation" in navigator) {
    setCarregandoLocalizacao(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,           // ✅ Timeout reduzido para 5s
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`Precisão da localização: ${accuracy} metros`);
        
        // ✅ Usar geolocalização só se for razoavelmente precisa
        if (accuracy < 1000) { // Menos de 1km de erro
          setLocalizacaoUsuario({ 
            lat: latitude, 
            lng: longitude 
          });
        } else {
          // ✅ Se imprecisa, usar coordenadas fixas
          console.warn("Localização imprecisa, usando coordenadas fixas");
          setLocalizacaoUsuario(coordenadasFixas);
        }
        setCarregandoLocalizacao(false);
      },
      (error) => {
        console.error("Erro ao obter localização, usando coordenadas fixas:", error);
        // ✅ Fallback para coordenadas fixas
        setLocalizacaoUsuario(coordenadasFixas);
        setCarregandoLocalizacao(false);
      },
      options
    );
  } else {
    // ✅ Navegador sem suporte, usar coordenadas fixas
    console.warn("Geolocalização não suportada, usando coordenadas fixas");
    setLocalizacaoUsuario(coordenadasFixas);
  }*/
}, []);

  // Carregar marcadores com base na proximidade
  useEffect(() => {
    const fetchMarcadores = async () => {
      if (!localizacaoUsuario) return;

      try {
        setCarregandoMarcadores(true); // ✅ Usando o estado correto
        const [empresas, centros] = await Promise.all([
          getPontosPorProximidade('empresa', localizacaoUsuario, raioDistancia * 1000),
          getPontosPorProximidade('centro', localizacaoUsuario, raioDistancia * 1000),
        ]);

        const processar = (itens, tipo) => itens.map(item => ({
          position: {
            lat: parseFloat(item.localizacao?.lat),
            lng: parseFloat(item.localizacao?.lng)
          },
          tipo,
          nome: item.nomeFantasia || item.razaoSocial || item.nome || "Sem nome",
          endereco: item.endereco || "Não informado",
          telefone: item.telefone || "Não informado",
          email: item.email || "Não informado",
          cnpj: item.cnpj || "Não informado",
          recebeResiduoComunidade: item.recebeResiduoComunidade || false,
          tiposMateriais: item.tiposMateriais || [],
          id: `${tipo}-${item._id}`,
          distancia: item.distancia
        })).filter(item => !isNaN(item.position.lat) && !isNaN(item.position.lng));

        const todosMarcadores = [
          ...processar(empresas, "empresa"),
          ...processar(centros, "centro")
        ];
      
        setMarcadoresOriginais(todosMarcadores);
        setMarcadores(todosMarcadores);
        setCarregandoMarcadores(false); 
      } catch (err) {
        console.error("Erro ao carregar marcadores:", err);
        setCarregandoMarcadores(false); 
      }
    };

    fetchMarcadores();
  }, [localizacaoUsuario, raioDistancia]);

  // Aplicar filtros
  useEffect(() => {
    if (marcadoresOriginais.length === 0) return;

    let marcadoresFiltrados = [...marcadoresOriginais];

    // Filtrar por tipo
    if (filtros.tipo !== 'todos') {
      marcadoresFiltrados = marcadoresFiltrados.filter(m => m.tipo === filtros.tipo);
    }

    // Filtrar por materiais
    if (filtros.materiais.length > 0) {
      marcadoresFiltrados = marcadoresFiltrados.filter(m => {
        if (m.tipo === 'empresa' && !m.recebeResiduoComunidade) {
          return false;
        }
        return m.tiposMateriais && m.tiposMateriais.some(material => 
          filtros.materiais.includes(material)
        );
      });
    }

    setMarcadores(marcadoresFiltrados);
  }, [filtros, marcadoresOriginais]);

  const handleFiltroChange = (novosFiltros) => {
    setFiltros(novosFiltros);
  };

  const handleRaioChange = (novoRaio) => {
    setRaioDistancia(novoRaio);
  };

  return (
    <div className='content' id="containerPrincipal">
      <div className='containerMaps' id="mapa-coleta">
        <div className='map-header'>
          <div className='section-title'>Localização das Empresas e Centros</div>
      
          <FiltroMapa
            filtros={filtros}
            onFiltroChange={handleFiltroChange}
            tiposMateriaisOptions={TIPOS_MATERIAIS_OPTIONS}
            raioDistancia={raioDistancia}
            onRaioChange={handleRaioChange}
          />
        </div>

        <div className='map-wrapper'>
          {carregandoLocalizacao ? (
            <div className="loading-message">Obtendo sua localização...</div>
          ) : carregandoMarcadores ? (
            <div className="loading-message">Carregando pontos de coleta...</div>
          ) : marcadores.length === 0 ? (
            <div className="no-data-message">
              {marcadoresOriginais.length === 0 
                ? "Nenhuma localização disponível para exibir" 
                : "Nenhum resultado encontrado para os filtros aplicados"
              }
            </div>
          ) : (
            <>
              <div className="filtro-info">
                <span>
                  Mostrando {marcadores.length} de {marcadoresOriginais.length} locais
                  {filtros.tipo !== 'todos' && ` • Tipo: ${filtros.tipo}`}
                  {filtros.materiais.length > 0 && ` • Materiais: ${filtros.materiais.join(', ')}`}
                  {` • Raio: ${raioDistancia} km`}
                </span>
              </div>
              
              <Map
                className="mapa"
                defaultCenter={localizacaoUsuario || center}
                defaultZoom={raioDistancia > 20 ? 10 : raioDistancia > 5 ? 12 : 14}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                gestureHandling={'greedy'}
              >
                {/* Marcador da localização do usuário */}
                {localizacaoUsuario && (
                  <AdvancedMarker 
                    position={localizacaoUsuario} 
                    zIndex={1000}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#4285F4',
                      border: '3px solid white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                    }}></div>
                  </AdvancedMarker>
                )}
                
                {/* Marcadores dos pontos de coleta */}
                {marcadores.map((m) => (
                  <AdvancedMarker key={m.id} position={m.position}>
                    <Pin {...m} />
                  </AdvancedMarker>
                ))}
              </Map>
            </>
          )}
        </div>
      </div>
      
      <div className='left-section'>
        <div className='containerRanked'>
          <div className='section-title'>Ranking das empresas</div>
          <div className='ranking-wrapper'>
            {error ? (
              <div className="error-message">{error}</div>
            ) : loading ? (
              <div className="loading-message">Carregando ranking...</div>
            ) : (
              <RankingEmpresas ranking={ranking} compactMode hideTitle />
            )}
          </div>
        </div>

        <div className='containerGraphic'>
          <div className='section-title'>Métricas de Reciclagem</div>
          <div className='grafico-wrapper'>
            {error ? (
              <div className="error-message">{error}</div>
            ) : loading ? (
              <div className="loading-message">Carregando gráficos...</div>
            ) : (
              <CarrosselGraficos 
                distribuicao={distribuicao}
                ranking={ranking}
                evolucao={evolucao}        
                impactoAmbiental={estatisticas.impactoAmbiental}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;