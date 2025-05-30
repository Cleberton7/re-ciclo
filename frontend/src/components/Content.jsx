import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import axios from "axios";
import "../pages/styles/content.css";
import "../pages/styles/containerPrincipal.css";

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: -3.7657,
  lng: -49.6725,
};

const Content = () => {
  const [marcadores, setMarcadores] = useState([]);

  useEffect(() => {
    const fetchLocalizacoes = async () => {
      try {
        const [empresasRes, coletoresRes] = await Promise.all([
          axios.get('http://localhost:5000/api/empresas/localizacoes'),
          axios.get('http://localhost:5000/api/coletor/localizacoes')
        ]);

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
      } catch (err) {
        console.error("Erro ao carregar localizações:", err);
      }
    };

    fetchLocalizacoes();
  }, []);

return (
    <div className='content' id="containerPrincipal">
      <div className='containerRanked'>
        <div id='textRanked'>Ranking das empresas</div>
        <div id='rankedEmpresa'>Ranked empresas</div>
      </div>

      <div className='containerGraphic'>
        <div id='textGraph'>Gráfico de coletas</div>
        <div id='graphic'>{/* gráfico aqui depois */}</div>
      </div>

      <div className='containerMaps'>
        <div id='textLoc'>Localização/empresas</div>
        <div id='maps'>
          <Map
            style={containerStyle}
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