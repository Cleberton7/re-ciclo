import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './styles/painelGenerico.css';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import "./styles/containerPrincipal.css"

const PainelGenerico = ({ tipoUsuario }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -3.765734, lng: -49.679455 });
  const [watchId, setWatchId] = useState(null);
  const navigate = useNavigate();

  // Clean up watchPosition on unmount
  useEffect(() => {
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      const endpoint = {
        empresa: 'api/empresas/dados',
        pessoa: 'api/usuarios/pessoal',
        coletor: 'api/coletor/dados'
      }[tipoUsuario];

      if (!endpoint) {
        setError(`Tipo de usuário não suportado: ${tipoUsuario}`);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const dadosRecebidos = response.data.data || response.data;

        const documento = tipoUsuario === "empresa"
          ? dadosRecebidos.cnpj || dadosRecebidos.documento || 'Não informado'
          : dadosRecebidos.cpf || dadosRecebidos.documento || 'Não informado';

        setDados({
          ...dadosRecebidos,
          documento,
          email: dadosRecebidos.email || 'Não informado'
        });

        if (dadosRecebidos.localizacao) {
          const { lat, lng } = dadosRecebidos.localizacao;
          if (lat && lng) {
            setLat(lat);
            setLng(lng);
            setMapCenter({ lat, lng });
          }
        }

      } catch (err) {
        console.error("Erro na requisição:", err);
        let errorMessage = "Erro ao carregar dados";
        if (err.response) {
          if (err.response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          errorMessage = err.response.data?.message ||
            `Erro ${err.response.status}: ${err.response.statusText}`;
        } else if (err.request) {
          errorMessage = "Sem resposta do servidor - verifique sua conexão";
        } else {
          errorMessage = err.message || "Erro desconhecido";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Check geolocation permissions
    if ("geolocation" in navigator) {
      navigator.permissions?.query({ name: 'geolocation' })
        .then(permissionStatus => {
          if (permissionStatus.state === 'denied') {
            alert('Por favor, permita acesso à localização nas configurações do site');
          }
        });
    }

    fetchData();
  }, [navigate, tipoUsuario]);

  const handleSaveLocation = async () => {
    if (!lat || !lng) {
      alert("Informe latitude e longitude válidas");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = {
        empresa: 'api/empresas/atualizar-localizacao',
        coletor: 'api/coletor/atualizar-localizacao'
      }[tipoUsuario];

      if (!endpoint) {
        alert("Tipo de usuário não suporta atualização de localização.");
        setSaving(false);
        return;
      }

      await axios.put(`http://localhost:5000/${endpoint}`, {
        localizacao: { lat: parseFloat(lat), lng: parseFloat(lng) }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Localização atualizada com sucesso!");

    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar localização");
    } finally {
      setSaving(false);
    }
  };

  const handleGeolocationError = (error) => {
    const errorMessages = {
      1: "Permissão negada. Ative a localização nas configurações.",
      2: "Localização indisponível. Verifique conexão/GPS.",
      3: "Tempo esgotado. Tente em área aberta.",
    };

    const message = errorMessages[error.code] || "Erro desconhecido";
    console.error(`Erro ${error.code}: ${message}`);
    alert(`${message}\n\nDica: Ative o GPS e conecte-se a uma rede Wi-Fi.`);
  };

  const handlePositionSuccess = (position) => {
    const accuracy = position.coords.accuracy;
    const newLat = position.coords.latitude;
    const newLng = position.coords.longitude;

    console.log(`Precisão: ${accuracy}m`, position.coords);

    if (accuracy > 1000) {
      alert(`Precisão baixa (${Math.round(accuracy)}m). Posição pode estar aproximada.`);
    }

    setLat(newLat);
    setLng(newLng);
    setMapCenter({ lat: newLat, lng: newLng });
  };

  const startWatchingPosition = () => {
    const id = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy < 50) {
          handlePositionSuccess(position);
          navigator.geolocation.clearWatch(watchId);
        }
      },
      handleGeolocationError,
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    setWatchId(id);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta geolocalização.");
      return;
    }

    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const standardOptions = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 30000
    };

    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      (error) => {
        console.warn('Falha GPS (alta precisão):', error.message);
  
        navigator.geolocation.getCurrentPosition(
          handlePositionSuccess,
          (fallbackError) => {
            console.error('Falha modo padrão:', fallbackError.message);
            handleGeolocationError(fallbackError);
          },
          standardOptions
        );
      },
      highAccuracyOptions
    );

    startWatchingPosition();
  };

  const handleMapClick = (e) => {
    const newLat = e.detail.latLng.lat;
    const newLng = e.detail.latLng.lng;
    setLat(newLat);
    setLng(newLng);
    setMapCenter({ lat: newLat, lng: newLng });
  };

  if (loading) return <div className="loading">Carregando dados...</div>;

  if (error) return (
    <div className="error">
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Tentar novamente</button>
    </div>
  );

  return (
      <div id="containerPrincipal">
        {(tipoUsuario === "empresa" || tipoUsuario === "coletor") ? (
          <div className="painel-content">
            <div className="dados-section">
              <h3>Seus Dados</h3>
              <div className="info-row">
                <span>Email:</span>
                <strong>{dados.email}</strong>
              </div>
              <div className="info-row">
                <span>{tipoUsuario === "empresa" ? "CNPJ" : "CPF"}:</span>
                <strong>{dados.documento}</strong>
              </div>
              {tipoUsuario === "empresa" && dados.tipoEmpresa && (
                <div className="info-row">
                  <span>Tipo Empresa:</span>
                  <strong>{dados.tipoEmpresa}</strong>
                </div>
              )}
              {tipoUsuario === "coletor" && (
                <div className="info-row">
                  <span>Veículo:</span>
                  <strong>{dados.veiculo || 'Não informado'}</strong>
                </div>
              )}
            </div>

            <div className="localizacao-section">
              <h3>Localização</h3>
              <div className="info-row">
                <button onClick={handleGetCurrentLocation}>
                  Usar localização atual
                </button>
              </div>
              <div style={{ height: '300px', width: '100%', margin: '10px 0' }}>
                <Map
                  defaultCenter={mapCenter}
                  defaultZoom={15}
                  mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                  style={{ height: '100%', width: '100%' }}
                  onClick={handleMapClick}
                >
                  {lat && lng && (
                    <AdvancedMarker
                      position={{ lat: Number(lat), lng: Number(lng) }}
                      title={dados.nome}
                    >
                      <div style={{
                        backgroundColor: tipoUsuario === "empresa" ? '#4285F4' : '#0F9D58',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}>
                        {tipoUsuario === "empresa" ? 'E' : 'C'}
                      </div>
                    </AdvancedMarker>
                  )}
                </Map>
              </div>
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
              <button onClick={handleSaveLocation} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Localização"}
              </button>
            </div>
          </div>
        ) : (
          // caso não seja empresa ou coletor
          <div className="dados-section">
            <h3>Seus Dados</h3>
            <div className="info-row">
              <span>Email:</span>
              <strong>{dados.email}</strong>
            </div>
            <div className="info-row">
              <span>{tipoUsuario === "empresa" ? "CNPJ" : "CPF"}:</span>
              <strong>{dados.documento}</strong>
            </div>
          </div>
        )}
      </div>
  );
};

export default PainelGenerico;