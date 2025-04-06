import React from 'react';
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import "../pages/styles/content.css";

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: -3.7657, // Tucuruí-PA
  lng: -49.6725,
};

const Content = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  console.log("Minha API Key:", import.meta.env.VITE_GOOGLE_MAPS_KEY);

  return (
    <div className='content'> 
      <div className='containerRanked'> 
        <div id='textRanked'> Ranking das empresas </div>
        <div id='rankedEmpresa'> Ranked empresas </div>
      </div>

      <div className='containerGraphic'> 
        <div id='textGraph'> Gráfico de coletas </div>
        <div id='graphic'> {/* gráfico aqui depois */} </div>
      </div>
      
      <div className='containerMaps'> 
        <div id='textLoc'> Localização/empresas </div>
        <div id='maps'>
          {apiKey ? (
            
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                options={{
                  mapId: '417aa5d2a794f56',
                }}
              >
                {/* Aqui vai o marcador avançado */}
                <gmp-advanced-marker
                  position={`${center.lat},${center.lng}`}
                  title="Centro de Tucuruí"
                />
              </GoogleMap>
         
          ) : (
            <p>Erro: API Key não encontrada</p>
          )}
        </div>
      </div> 
    </div>
  );
};

export default Content;
