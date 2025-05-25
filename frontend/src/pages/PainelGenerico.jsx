import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './styles/painelGenerico.css';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';

const PainelGenerico = ({ tipoUsuario }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -3.765734, lng: -49.679455 });
  const [watchId, setWatchId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [tempDados, setTempDados] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

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
        coletor: 'api/coletor/dados',
        admGeral: 'api/admin/dados'
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

        const dadosFormatados = {
          ...dadosRecebidos,
          documento,
          email: dadosRecebidos.email || 'Não informado'
        };

        setDados(dadosFormatados);
        setTempDados(dadosFormatados);

        if (dadosRecebidos.localizacao) {
          const { lat, lng } = dadosRecebidos.localizacao;
          if (lat && lng) {
            setLat(lat);
            setLng(lng);
            setMapCenter({ lat, lng });
          }
        }

        if (dadosRecebidos.imagemPerfil) {
          setImagePreview(`http://localhost:5000/uploads/${dadosRecebidos.imagemPerfil}`);
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

  const handleEdit = () => {
    setEditing(true);
    setTempDados({ ...dados });
  };

  const handleCancel = () => {
    setEditing(false);
    setTempDados({ ...dados });
    setImagePreview(dados.imagemPerfil ? `http://localhost:5000/uploads/${dados.imagemPerfil}` : null);
    setImageFile(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    
    try {
      const formData = new FormData();
      
      // Campos genéricos para todos os tipos
      formData.append('documento', tempDados.documento);
      
      // Campos específicos por tipo de usuário
      switch(tipoUsuario) {
        case "empresa":
          formData.append('razaoSocial', tempDados.razaoSocial || '');
          formData.append('telefone', tempDados.telefone || '');
          break;
        
        case "pessoa":
          formData.append('nome', tempDados.nome || '');
          formData.append('telefone', tempDados.telefone || '');
          break;
        
        case "coletor":
          formData.append('veiculo', tempDados.veiculo || '');
          formData.append('capacidadeColeta', tempDados.capacidadeColeta || '');
          break;
      }

      // Adiciona a imagem se foi selecionada
      if (imageFile) {
        formData.append('imagemPerfil', imageFile);
      }

      const endpoint = {
        empresa: 'api/empresas/atualizar',
        pessoa: 'api/usuarios/atualizar',
        coletor: 'api/coletor/atualizar'
      }[tipoUsuario];

      const response = await axios.put(`http://localhost:5000/${endpoint}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Atualiza preview da imagem com novo caminho
      const novosDados = response.data.data || response.data;
      setDados(novosDados);
      setImagePreview(novosDados.imagemPerfil 
        ? `http://localhost:5000/uploads/${novosDados.imagemPerfil}`
        : null
      );
      
      setEditing(false);
      alert("Dados atualizados com sucesso!");

    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Erro ao atualizar dados";
      alert(`Erro: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempDados(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

    //console.log(`Precisão: ${accuracy}m`, position.coords);

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

  if (!dados) return null;

  return (
    <div className="painel-container" id="containerPrincipal">
      <div className="painel-header">
        <h2>Painel do {tipoUsuario === 'empresa' ? 'Empresa' : tipoUsuario === 'coletor' ? 'Coletor' : 'Usuário'}</h2>
        {tipoUsuario !== 'admGeral' && (
          <div className="action-buttons">
            {!editing ? (
              <button onClick={handleEdit} className="edit-button">Editar Dados</button>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} className="save-button">
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button onClick={handleCancel} disabled={saving} className="cancel-button">
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="painel-content">
        <div className="profile-section">
          <div className="image-upload">
            <div className="image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : (
                <div className="image-placeholder">
                  {tipoUsuario === 'empresa' ? 'Logo da Empresa' : 'Foto de Perfil'}
                </div>
              )}
            </div>
            {editing && (
              <div className="upload-controls">
                <label htmlFor="image-upload" className="upload-button">
                  Selecionar Imagem
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                {imagePreview && (
                  <button 
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }} 
                    className="remove-image-button"
                  >
                    Remover
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="dados-section">
            <h3>Informações {tipoUsuario === 'empresa' ? 'da Empresa' : 'Pessoais'}</h3>
            
            <div className="info-row">
              <span>Email:</span>
              {editing ? (
                <input
                  type="email"
                  value={tempDados.email || ''}
                  onChange={handleInputChange}
                  name="email"
                  disabled // Email não pode ser editado
                />
              ) : (
                <strong>{dados.email}</strong>
              )}
            </div>

            <div className="info-row">
              <span>{tipoUsuario === "empresa" ? "CNPJ" : "CPF"}:</span>
              {editing ? (
                <input
                  type="text"
                  value={tempDados.documento || ''}
                  onChange={handleInputChange}
                  name="documento"
                  disabled // Documento não pode ser editado
                />
              ) : (
                <strong>{dados.documento}</strong>
              )}
            </div>

            {tipoUsuario === "empresa" && (
              <div className="info-row">
                <span>Razão Social:</span>
                {editing ? (
                  <input
                    type="text"
                    value={tempDados.razaoSocial || ''}
                    onChange={handleInputChange}
                    name="razaoSocial"
                  />
                ) : (
                  <strong>{dados.razaoSocial || 'Não informado'}</strong>
                )}
              </div>
            )}

            {(tipoUsuario === "pessoa" || tipoUsuario === "empresa") && (
              <div className="info-row">
                <span>{tipoUsuario === "empresa" ? "Telefone Comercial" : "Telefone"}:</span>
                {editing ? (
                  <input
                    type="text"
                    value={tempDados.telefone || ''}
                    onChange={handleInputChange}
                    name="telefone"
                  />
                ) : (
                  <strong>{dados.telefone || 'Não informado'}</strong>
                )}
              </div>
            )}

            {tipoUsuario === "coletor" && (
              <>
                <div className="info-row">
                  <span>Veículo:</span>
                  {editing ? (
                    <input
                      type="text"
                      value={tempDados.veiculo || ''}
                      onChange={handleInputChange}
                      name="veiculo"
                    />
                  ) : (
                    <strong>{dados.veiculo || 'Não informado'}</strong>
                  )}
                </div>
                <div className="info-row">
                  <span>Capacidade de Coleta:</span>
                  {editing ? (
                    <input
                      type="number"
                      value={tempDados.capacidadeColeta || ''}
                      onChange={handleInputChange}
                      name="capacidadeColeta"
                    />
                  ) : (
                    <strong>{dados.capacidadeColeta || 'Não informado'}</strong>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {(tipoUsuario === "empresa" || tipoUsuario === "coletor") && (
          <div className="localizacao-section">
            <h3>Localização</h3>
            <div className="info-row">
              <button onClick={handleGetCurrentLocation} className="location-button">
                Usar localização atual
              </button>
            </div>
            <div className="map-container">
              <Map
                defaultCenter={mapCenter}
                defaultZoom={15}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                onClick={handleMapClick}
              >
                {lat && lng && (
                  <AdvancedMarker
                    position={{ lat: Number(lat), lng: Number(lng) }}
                    title={dados.nome || dados.razaoSocial}
                  >
                    <div className="marker">
                      {tipoUsuario === "empresa" ? 'E' : 'C'}
                    </div>
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
        )}
      </div>
    </div>
  );
};

export default PainelGenerico;