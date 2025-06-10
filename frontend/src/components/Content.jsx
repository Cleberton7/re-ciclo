import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import axios from "axios";
import GraficoColetas from './GraficoColetas';
import RankingEmpresas from './RankingEmpresas';
import "../pages/styles/content.css";
import "../pages/styles/containerPrincipal.css";

const center = { lat: -3.7657, lng: -49.6725 };

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
            axios.get('http://localhost:5000/api/empresas/localizacoes'),
            axios.get('http://localhost:5000/api/coletor/localizacoes')
          ]),
          axios.get('http://localhost:5000/api/public/coletas'),
          axios.get('http://localhost:5000/api/public/ranking')
        ]);

        // Processar localizações
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
            tipo: 'coletor', 
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
      {/* Ranking de Empresas */}
      <div className='containerRanked'>
        <div id='textRanked'>Ranking das empresas</div>
        <div id='rankedEmpresa'>
          {loading ? (
            <p>Carregando ranking...</p>
          ) : (
            <RankingEmpresas ranking={rankingEmpresas} />
          )}
        </div>
      </div>

      {/* Gráfico de Coletas */}
      <div className='containerGraphic'>
        <div id='textGraph'>Gráfico de coletas</div>
        <div id='graphic'>
          {loading ? (
            <p>Carregando gráfico...</p>
          ) : (
            <div style={{ height: '300px' }}>
              <GraficoColetas dados={dadosGrafico} />
            </div>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className='containerMaps'>
        <div id='textLoc'>Localização/empresas</div>
        <div id='maps'>
          <Map
            className="mapa"
            defaultCenter={center}
            defaultZoom={12}
            mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
          >
            {marcadores.map((marcador, index) => (
              <AdvancedMarker
                key={index}
                position={{ lat: marcador.lat, lng: marcador.lng }}
                title={`${marcador.tipo}: ${marcador.nome}`}
              >
                <div style={{
                  backgroundColor: marcador.tipo === 'empresa' ? '#4285F4' : '#0F9D58',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '50%',
                  fontSize: '14px',
                  transform: 'translate(-50%, -50%)'
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