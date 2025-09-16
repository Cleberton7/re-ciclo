import React, { useEffect, useState, useMemo } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getEmpresasPublicas, getCentrosReciclagemPublicos } from '../services/publicDataServices';
import usePublicColetasData from '../hooks/usePublicColetasData';
import RankingEmpresas from '../components/GraficoColetas/RankingEmpresas';
import Pin from '../components/Pin';
import CarrosselGraficos from '../components/GraficoColetas/CarrosselGraficos';
import FiltroMapa from '../components/FiltroMapa'; // ✅ Componente novo
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
    tipo: 'todos', // 'todos', 'empresa', 'centro'
    materiais: [] // array com materiais selecionados
  });

  const filters = useMemo(() => ({ periodo: "total" }), []);

  const {
    ranking,
    distribuicao,
    estatisticas,
    evolucao,
    loading,
    error,
  } = usePublicColetasData(filters);

  // Carregar marcadores
  useEffect(() => {
    const fetchMarcadores = async () => {
      try {
        const [empresas, centros] = await Promise.all([
          getEmpresasPublicas(),
          getCentrosReciclagemPublicos(),
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
        })).filter(item => !isNaN(item.position.lat) && !isNaN(item.position.lng));

        const todosMarcadores = [
          ...processar(empresas, "empresa"),
          ...processar(centros, "centro")
        ];
      
        setMarcadoresOriginais(todosMarcadores);
        setMarcadores(todosMarcadores);
      } catch (err) {
        console.error("Erro ao carregar marcadores:", err);
      }
    };

    fetchMarcadores();
  }, []);

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
        // Para empresas, só filtrar se recebem resíduos
        if (m.tipo === 'empresa' && !m.recebeResiduoComunidade) {
          return false;
        }
        // Verificar se tem pelo menos um material selecionado
        return m.tiposMateriais && m.tiposMateriais.some(material => 
          filtros.materiais.includes(material)
        );
      });
    }

    setMarcadores(marcadoresFiltrados);
  }, [filtros, marcadoresOriginais]);

  // Função para atualizar filtros
  const handleFiltroChange = (novosFiltros) => {
    setFiltros(novosFiltros);
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
          />
        </div>

        <div className='map-wrapper'>
          {marcadores.length === 0 ? (
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
                </span>
              </div>
              
              <Map
                className="mapa"
                defaultCenter={center}
                defaultZoom={14}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                gestureHandling={'greedy'}
              >
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