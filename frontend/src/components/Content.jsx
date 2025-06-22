import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import axios from "axios";
import GraficoColetas from './GraficoColetas';
import RankingEmpresas from './RankingEmpresas';
import "../pages/styles/content.css";

const center = { lat: -3.7657, lng: -49.6725 };

const API_URL = import.meta.env.VITE_API_URL;

const Content = () => {
  const [marcadores, setMarcadores] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [rankingEmpresas, setRankingEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          empresasRes, 
          coletoresRes,
          graficoRes, 
          rankingRes
        ] = await Promise.all([
          axios.get(`${API_URL}/empresas/localizacoes`),
          axios.get(`${API_URL}/centros-reciclagem/localizacoes`),
          axios.get(`${API_URL}/public/coletas`),
          axios.get(`${API_URL}/public/ranking`)
        ]);

        const empresas = empresasRes.data || [];
        const coletores = coletoresRes.data || [];

        const pontos = [
          ...empresas.map(e => ({
            ...e.localizacao,
            tipo: 'empresa',
            nome: e.nome,
            id: `empresa-${e.id}`
          })),
          ...coletores.map(c => ({
            ...c.localizacao,
            tipo: 'centro',
            nome: c.nome,
            id: `centro-${c.id}`
          }))
        ].filter(p => {
          const lat = parseFloat(p.lat);
          const lng = parseFloat(p.lng);
          return !isNaN(lat) && !isNaN(lng);
        }).map(p => ({
          ...p,
          lat: parseFloat(p.lat),
          lng: parseFloat(p.lng)
        }));

        setMarcadores(pontos);
        setDadosGrafico(graficoRes.data?.data || []);
        setRankingEmpresas(rankingRes.data?.data || []);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Erro ao carregar dados. Tente recarregar a página.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='content' id="containerPrincipal">
      {/* Seção Esquerda (Gráfico e Ranking) */}
      <div className='left-section'>
        {/* Ranking de Empresas */}
        <div className='containerRanked'>
          <div className='section-title'>Ranking das empresas</div>
          <div className='ranking-wrapper'>
            {error ? (
              <div className="error-message">{error}</div>
            ) : loading ? (
              <p>Carregando ranking...</p>
            ) : (
              <RankingEmpresas
                ranking={rankingEmpresas}
                compactMode={true}
                hideTitle={true}
              />
            )}
          </div>
        </div>

        {/* Gráfico de Coletas */}
        <div className='containerGraphic'>
          <div className='section-title'>Distribuição por Material</div>
          <div className='grafico-wrapper'>
            {error ? (
              <div className="error-message">{error}</div>
            ) : loading ? (
              <div className="loading-message">Carregando gráfico...</div>
            ) : dadosGrafico.length > 0 ? (
              <GraficoColetas
                dados={dadosGrafico}
                compactMode={true}
              />
            ) : (
              <div className="no-data-message">
                Nenhum dado disponível para exibir
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mapa (Seção Direita - Tamanho Fixo) */}
      <div className='containerMaps'>
        <div className='section-title'>Localização das Empresas e Centros</div>
        <div className='map-wrapper'>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <Map
              className="mapa"
              defaultCenter={center}
              defaultZoom={12}
              mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
              gestureHandling={'greedy'}
            >
              {marcadores.map((marcador) => (
                <AdvancedMarker 
                  key={marcador.id} 
                  position={{ lat: marcador.lat, lng: marcador.lng }}
                  title={marcador.nome}
                >
                  <div className={`marker ${marcador.tipo}`}>
                    {marcador.tipo === 'empresa' ? 'E' : 'C'}
                  </div>
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