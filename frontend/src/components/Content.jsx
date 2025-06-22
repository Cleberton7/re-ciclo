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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [localizacoesRes, graficoRes, rankingRes] = await Promise.all([
          axios.all([
            axios.get(`${API_URL}/empresas/localizacoes`),
            axios.get(`${API_URL}/centros-reciclagem/localizacoes`)
          ]),
          axios.get(`${API_URL}/public/coletas`),
          axios.get(`${API_URL}/public/ranking`)
        ]);

        const [empresasRes, coletoresRes] = localizacoesRes;
        const empresas = empresasRes.data || [];
        const coletores = coletoresRes.data || [];

        const pontos = [
          ...empresas.map(e => ({
            ...e.localizacao,
            tipo: 'empresa',
            nome: e.nome
          })),
          ...coletores.map(c => ({
            ...c.localizacao,
            tipo: 'centro',
            nome: c.nome
          }))
        ].filter(p => p.lat && p.lng);

        setMarcadores(pontos);
        setDadosGrafico(graficoRes.data?.data || []);
        setRankingEmpresas(rankingRes.data?.data || []);

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
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
            <div id='textRanked'>Ranking das empresas</div>
            <div className='ranking-wrapper'>
              {loading ? (
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
            <div id='textGraph'>Distribuição por Material</div>
            <div className='grafico-wrapper'>
              {loading ? (
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

        {/* Mapa (Seção Direita - Maior) */}
        <div className='containerMaps'>
          <div id='textLoc'>Localização das Empresas e Centros</div>
          <div id='maps'>
            <Map
              className="mapa"
              defaultCenter={center}
              defaultZoom={12}
              mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
              gestureHandling={'greedy'}
            >
              {marcadores.map((marcador, index) => (
                <AdvancedMarker key={index} position={{ lat: marcador.lat, lng: marcador.lng }}>
                  <div style={{
                    backgroundColor: marcador.tipo === 'empresa' ? '#4285F4' : '#0F9D58',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 12
                  }}>
                    {marcador.tipo === 'empresa' ? 'E' : 'C'}
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </div>
        </div>
      </div>
  );
};

export default Content;