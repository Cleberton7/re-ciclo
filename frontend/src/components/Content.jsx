import React, { useRef, useEffect } from 'react';
import { GoogleMap } from "@react-google-maps/api";
import "../pages/styles/content.css";

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: -3.7657,
  lng: -49.6725,
};

const Content = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.google && mapRef.current) {
      const { AdvancedMarkerElement } = window.google.maps.marker;
      
      new AdvancedMarkerElement({
        position: center,
        map: mapRef.current,
        title: "Centro de Tucuruí",
      });
    }
  }, []);

  return (
    <div className='content'>
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
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={(map) => (mapRef.current = map)}
          >
            {/* Removido o <Marker /> antigo */}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
};

export default Content;
