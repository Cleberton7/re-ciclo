import React from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import Pin from '../Pin';
import './Styles/LocationSection.css';

const LocationSection = ({ 
  tipoUsuario, 
  lat, 
  lng, 
  setLat, 
  setLng, 
  mapCenter, 
  handleMapClick, 
  handleGetCurrentLocation, 
  handleSaveLocation, 
  saving,
  dados
}) => {
  if (tipoUsuario !== "empresa" && tipoUsuario !== "centro") return null;

  // Dados para o marcador personalizado
  const markerData = {
    tipo: tipoUsuario,
    nome: dados.nomeExibido,
    endereco: dados.endereco || "Não informado",
    telefone: dados.telefone || "Não informado",
    email: dados.email || "Não informado",
    cnpj: tipoUsuario === "empresa" || tipoUsuario === "centro" ? dados.documento : null,
    recebeResiduoComunidade: dados.recebeResiduoComunidade || false
  };

  return (
    <div className="localizacao-section">
      <h3>Localização</h3>
      <div className="info-row">
        <button 
          onClick={handleGetCurrentLocation} 
          className="location-button"
        >
          Usar localização atual
        </button>
      </div>
      <div className="map-container">
        <Map
          defaultCenter={mapCenter}
          defaultZoom={15}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
          onClick={handleMapClick}
          gestureHandling={'greedy'}
        >
          {lat && lng && (
            <AdvancedMarker
              position={{ lat: Number(lat), lng: Number(lng) }}
              title={dados.nomeExibido}
            >
              <Pin {...markerData} />
            </AdvancedMarker>
          )}
        </Map>
      </div>
      <div className="coordinates-input">
        <div className="info-row">
          <span>Latitude:</span>
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            step="0.000001"
          />
        </div>
        <div className="info-row">
          <span>Longitude:</span>
          <input
            type="number"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            step="0.000001"
          />
        </div>
        <button 
          onClick={handleSaveLocation} 
          disabled={saving}
          className="save-location-button"
        >
          {saving ? "Salvando..." : "Salvar Localização"}
        </button>
      </div>
    </div>
  );
};

export default LocationSection;