import React, { useEffect, useState, useMemo } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getEmpresasPublicas, getCentrosReciclagemPublicos } from '../services/publicDataServices';
import usePublicColetasData from '../hooks/usePublicColetasData';
import RankingEmpresas from './RankingEmpresas';
import Pin from '../components/Pin';
import CarrosselGraficos from '../components/CarrosselGraficos';
import "../pages/styles/content.css";

const center = { lat: -3.7657, lng: -49.6725 };

const Content = () => {
  const [marcadores, setMarcadores] = useState([]);

  // Memorizar filtro para evitar loop
  const filters = useMemo(() => ({ periodo: "total" }), []);

  // Agora pegamos também 'evolucao'
  const {
    ranking,
    distribuicao,
    estatisticas,
    evolucao,
    loading,
    error,
  } = usePublicColetasData(filters);

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
          id: `${tipo}-${item._id}`,
        })).filter(item => !isNaN(item.position.lat) && !isNaN(item.position.lng));

        const marcadores = [
          ...processar(empresas, "empresa"),
          ...processar(centros, "centro")
        ];

        setMarcadores(marcadores);
      } catch (err) {
        console.error("Erro ao carregar marcadores:", err);
      }
    };

    fetchMarcadores();
  }, []);

  return (
    <div className='content' id="containerPrincipal">
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

      <div className='containerMaps'>
        <div className='section-title'>Localização das Empresas e Centros</div>
        <div className='map-wrapper'>
          {marcadores.length === 0 ? (
            <div className="no-data-message">
              Nenhuma localização disponível para exibir
            </div>
          ) : (
            <Map
              className="mapa"
              defaultCenter={center}
              defaultZoom={12}
              mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
              gestureHandling={'greedy'}
            >
              {marcadores.map((m) => (
                <AdvancedMarker key={m.id} position={m.position}>
                  <Pin {...m} />
                </AdvancedMarker>
              ))}
            </Map>
          )}
        </div>
      </div>
    </div>
  );
};

export default Content;
