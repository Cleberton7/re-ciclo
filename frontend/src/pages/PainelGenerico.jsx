import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './styles/painelGenerico.css';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { IMaskInput } from 'react-imask';
import { ClipLoader } from "react-spinners";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
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
        const documento = tipoUsuario === "empresa" || tipoUsuario === "coletor"
          ? dadosRecebidos.cnpj || 'Não informado'
          : dadosRecebidos.cpf || 'Não informado';

        const nomeExibido = tipoUsuario === "empresa"
          ? dadosRecebidos.razaoSocial
          : tipoUsuario === "coletor"
          ? dadosRecebidos.nomeFantasia
          : dadosRecebidos.nome;

        const dadosFormatados = {
          ...dadosRecebidos,
          documento,
          nomeExibido,
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
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, tipoUsuario]);

  const handleEdit = () => {
    setEditing(true);
    setTempDados({ ...dados });
    setRemoveImage(false);
  };

  const handleCancel = () => {
      setEditing(false);
      setTempDados({ ...dados });
      setImagePreview(dados.imagemPerfil ? `http://localhost:5000/uploads/${dados.imagemPerfil}` : null);
      setImageFile(null);
      setRemoveImage(false);
    };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    
    try {
      const formData = new FormData();
      
      // Campos comuns
      formData.append('telefone', tempDados.telefone || '');
      formData.append('endereco', tempDados.endereco || '');

      // Campos específicos por tipo de usuário
      if (tipoUsuario === "empresa") {
        formData.append('razaoSocial', tempDados.razaoSocial || '');
        formData.append('nomeFantasia', tempDados.nomeFantasia || '');
      } else if (tipoUsuario === "pessoa") {
        formData.append('nome', tempDados.nome || '');
      } else if (tipoUsuario === "coletor") {
        formData.append('nomeFantasia', tempDados.nomeFantasia || '');
        formData.append('veiculo', tempDados.veiculo || '');
        formData.append('capacidadeColeta', tempDados.capacidadeColeta || '');
      }

      if (imageFile) {
        formData.append('imagemPerfil', imageFile);
      } else if (removeImage) {
        formData.append('removeImage', 'true');
      }

      const response = await axios.put(
        `http://localhost:5000/api/usuario/dados`, 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Atualização completa dos dados
      const novosDados = response.data.data || response.data;
      
      // Construir a URL da imagem corretamente
      let updatedImageUrl = null;
      if (removeImage) {
        updatedImageUrl = null;
      } else if (imageFile) {
        // Se foi enviada uma nova imagem, usar o preview temporário
        updatedImageUrl = URL.createObjectURL(imageFile);
      } else if (novosDados.imagemPerfil) {
        // Se não foi alterada a imagem, usar o caminho do servidor
        updatedImageUrl = novosDados.imagemPerfil.includes('http') 
          ? novosDados.imagemPerfil 
          : `http://localhost:5000/uploads/${novosDados.imagemPerfil}`;
      } else if (dados.imagemPerfil && !removeImage) {
        // Manter a imagem existente se não foi removida
        updatedImageUrl = dados.imagemPerfil.includes('http')
          ? dados.imagemPerfil
          : `http://localhost:5000/uploads/${dados.imagemPerfil}`;
      }

      setDados(prev => ({
        ...prev, // Mantém todos os dados anteriores
        ...novosDados, // Adiciona os novos dados
        documento: tipoUsuario === "empresa" || tipoUsuario === "coletor" 
          ? novosDados.cnpj || prev.documento 
          : novosDados.cpf || prev.documento,
        nomeExibido: tipoUsuario === "empresa"
          ? novosDados.razaoSocial || prev.nomeExibido
          : tipoUsuario === "coletor"
          ? novosDados.nomeFantasia || prev.nomeExibido
          : novosDados.nome || prev.nomeExibido,
        imagemPerfil: updatedImageUrl // Atualiza a URL da imagem
      }));

      setImagePreview(updatedImageUrl);
      setEditing(false);
      setRemoveImage(false);
      setImageFile(null);
      alert("Dados atualizados com sucesso!");

    } catch (err) {
      console.error("Erro ao atualizar:", err);
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
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }
      setImageFile(file);
      setRemoveImage(false); // Se o usuário selecionar nova imagem, cancela a remoção
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setRemoveImage(true);
  };
  const handleDeleteAccount = async () => {
    const confirmacao = window.confirm(
      'Tem certeza que deseja excluir sua conta permanentemente?\nEsta ação não pode ser desfeita!'
    );
    
    if (!confirmacao) return;
    
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/usuario/conta`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.removeItem("token");
      alert("Sua conta foi excluída com sucesso");
      navigate("/login");
      
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      const errorMessage = err.response?.data?.message || "Erro ao excluir conta";
      alert(`Erro: ${errorMessage}`);
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
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

if (loading) return (
    <div className="loading-screen">
      <ClipLoader color="#009951" size={50} />
      <p>Carregando seus dados...</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
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
              <>
                <button onClick={handleEdit} className="edit-button">
                  Editar Dados
                </button>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="delete-account-button"
                >
                  Excluir Conta
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} className="save-button">
                  {saving ? <ClipLoader color="#fff" size={18} /> : 'Salvar Alterações'}
                </button>
                <button onClick={handleCancel} disabled={saving} className="cancel-button">
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Confirmar Exclusão de Conta</h3>
            <p>Tem certeza que deseja excluir sua conta permanentemente? Todos os seus dados serão removidos.</p>
            
            <div className="modal-buttons">
              <button 
                onClick={handleDeleteAccount} 
                disabled={deletingAccount}
                className="confirm-delete-button"
              >
                {deletingAccount ? <ClipLoader color="#fff" size={18} /> : 'Confirmar Exclusão'}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                disabled={deletingAccount}
                className="cancel-delete-button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="painel-content">
        <div className="profile-section">
          <div className="image-upload">
            <div className="image-preview">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/imagem-padrao.jpg';
                  }}
                />
              ) : (
                <div className="image-placeholder">
                  {tipoUsuario === 'empresa' ? 'Logo da Empresa' : 'Foto de Perfil'}
                </div>
              )}
            </div>
            {editing && (
              <div className="upload-controls">
                <label htmlFor="image-upload" className="upload-button">
                  {imagePreview ? 'Alterar Imagem' : 'Selecionar Imagem'}
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
                    onClick={handleRemoveImage}
                    className="remove-image-button"
                  >
                    Remover Imagem
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="dados-section">
            <h3>Informações {tipoUsuario === 'empresa' ? 'da Empresa' : tipoUsuario === 'coletor' ? 'do Coletor' : 'Pessoais'}</h3>
            
            <div className="info-row">
              <span>Email:</span>
              <strong>{dados.email}</strong>
            </div>

            <div className="info-row">
              <span>{tipoUsuario === "empresa" || tipoUsuario === "coletor" ? "CNPJ" : "CPF"}:</span>
              <strong>{dados.documento}</strong>
            </div>

            <div className="info-row">
              <span>{tipoUsuario === "empresa" ? "Razão Social" : tipoUsuario === "coletor" ? "Nome Fantasia" : "Nome"}:</span>
              {editing ? (
                <input
                  type="text"
                  value={tempDados[tipoUsuario === "empresa" ? "razaoSocial" : tipoUsuario === "coletor" ? "nomeFantasia" : "nome"] || ''}
                  onChange={(e) => setTempDados(prev => ({
                    ...prev,
                    [tipoUsuario === "empresa" ? "razaoSocial" : tipoUsuario === "coletor" ? "nomeFantasia" : "nome"]: e.target.value
                  }))}
                />
              ) : (
                <strong>{dados.nomeExibido}</strong>
              )}
            </div>

            <div className="info-row">
              <span>Telefone:</span>
              {editing ? (
                <IMaskInput
                  mask={[
                    { mask: '(00) 0000-0000' },
                    { mask: '(00) 00000-0000' }
                  ]}
                  name="telefone"
                  value={tempDados.telefone || ''}
                  onAccept={(value) => setTempDados(prev => ({ ...prev, telefone: value }))}
                />
              ) : (
                <strong>{dados.telefone || 'Não informado'}</strong>
              )}
            </div>

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
                  <span>Capacidade de Coleta (kg):</span>
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
              >
                {lat && lng && (
                  <AdvancedMarker
                    position={{ lat: Number(lat), lng: Number(lng) }}
                    title={dados.nomeExibido}
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