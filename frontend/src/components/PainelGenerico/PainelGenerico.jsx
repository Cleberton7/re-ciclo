import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { API_URL, BASE_URL } from '../../config/config';
import ActionButtons from './ActionButtons';
import DeleteAccountModal from './DeleteAccountModal';
import ProfileImageUpload from './ProfileImageUpload';
import ProfileInfoSection from './ProfileInfoSection';
import LocationSection from './LocationSection';
import VoltarLink from "../VoltarLink";
import './Styles/painelGenerico.css';




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
        empresa: 'empresas/dados',
        pessoa: 'usuarios/pessoal',
        centro: 'centros-reciclagem/dados',
        admGeral: 'admin/dados'
      }[tipoUsuario];

      if (!endpoint) {
        setError(`Tipo de usuário não suportado: ${tipoUsuario}`);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const dadosRecebidos = response.data.data || response.data;
        const documento = tipoUsuario === "empresa" || tipoUsuario === "centro"
          ? dadosRecebidos.cnpj || 'Não informado'
          : dadosRecebidos.cpf || 'Não informado';

        const nomeExibido = tipoUsuario === "empresa"
          ? dadosRecebidos.razaoSocial
          : tipoUsuario === "centro"
          ? dadosRecebidos.nomeFantasia
          : dadosRecebidos.nome;

        const dadosFormatados = {
          ...dadosRecebidos,
          documento,
          nomeExibido,
          email: dadosRecebidos.email || 'Não informado',
          recebeResiduoComunidade: dadosRecebidos.recebeResiduoComunidade || false,
          tiposMateriais: dadosRecebidos.tiposMateriais || [] 
        };

        setDados(dadosFormatados);
        setTempDados(dadosFormatados);

      if (dadosRecebidos.localizacao) {
        // ✅ FORMATO GEOJSON: coordinates: [longitude, latitude]
        if (dadosRecebidos.localizacao.coordinates && 
            Array.isArray(dadosRecebidos.localizacao.coordinates) &&
            dadosRecebidos.localizacao.coordinates.length === 2) {
          
          const [lng, lat] = dadosRecebidos.localizacao.coordinates;
          setLat(lat);
          setLng(lng);
          setMapCenter({ lat, lng });
        }
        // ✅ Mantém compatibilidade com formato antigo
        else if (dadosRecebidos.localizacao.lat && dadosRecebidos.localizacao.lng) {
          setLat(dadosRecebidos.localizacao.lat);
          setLng(dadosRecebidos.localizacao.lng);
          setMapCenter({ 
            lat: dadosRecebidos.localizacao.lat, 
            lng: dadosRecebidos.localizacao.lng 
          });
        }
      }

        if (dadosRecebidos.imagemPerfil) {
          setImagePreview(`${BASE_URL}/uploads/${dadosRecebidos.imagemPerfil}`);
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
    setImagePreview(dados.imagemPerfil ? `${BASE_URL}/uploads/${dados.imagemPerfil}` : null);
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
        formData.append('recebeResiduoComunidade', tempDados.recebeResiduoComunidade ? 'true' : 'false');
        if (tempDados.recebeResiduoComunidade && tempDados.tiposMateriais) {
          formData.append('tiposMateriais', JSON.stringify(tempDados.tiposMateriais));
        }
      } else if (tipoUsuario === "pessoa") {
        formData.append('nome', tempDados.nome || '');
      } else if (tipoUsuario === "centro") {
        formData.append('nomeFantasia', tempDados.nomeFantasia || '');
        formData.append('veiculo', tempDados.veiculo || '');
        formData.append('capacidadeColeta', tempDados.capacidadeColeta || '');
        if (tempDados.recebeResiduoComunidade && tempDados.tiposMateriais) {
          formData.append('tiposMateriais', JSON.stringify(tempDados.tiposMateriais));
        }
      }

      if (imageFile) {
        formData.append('imagemPerfil', imageFile);
      } else if (removeImage) {
        formData.append('removeImage', 'true');
      }

      const response = await axios.put(
        `${API_URL}/usuarios/dados`, 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const novosDados = response.data.data || response.data;
      
      let updatedImageUrl = null;
      if (removeImage) {
        updatedImageUrl = null;
      } else if (imageFile) {
        updatedImageUrl = URL.createObjectURL(imageFile);
      } else if (novosDados.imagemPerfil) {
        updatedImageUrl = novosDados.imagemPerfil.includes('http') 
          ? novosDados.imagemPerfil 
          : `${BASE_URL}/uploads/${novosDados.imagemPerfil}`;
      } else if (dados.imagemPerfil && !removeImage) {
        updatedImageUrl = dados.imagemPerfil.includes('http')
          ? dados.imagemPerfil
          : `${BASE_URL}/uploads/${dados.imagemPerfil}`;
      }

      setDados(prev => ({
        ...prev,
        ...novosDados,
        documento: tipoUsuario === "empresa" || tipoUsuario === "centro" 
          ? novosDados.cnpj || prev.documento 
          : novosDados.cpf || prev.documento,
        nomeExibido: tipoUsuario === "empresa"
          ? novosDados.razaoSocial || prev.nomeExibido
          : tipoUsuario === "centro"
          ? novosDados.nomeFantasia || prev.nomeExibido
          : novosDados.nome || prev.nomeExibido,
        imagemPerfil: updatedImageUrl,
        tiposMateriais: novosDados.tiposMateriais || prev.tiposMateriais || []
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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'recebeResiduoComunidade') {
      setTempDados(prev => ({ 
        ...prev, 
        [name]: checked,
        // Limpa tipos de materiais se desmarcar recebimento de resíduos
        ...(checked === false && { tiposMateriais: [] })
      }));
    } else if (type === 'checkbox' && name.startsWith('tipoMaterial-')) {
      const materialValue = name.replace('tipoMaterial-', '');
      setTempDados(prev => {
        const updatedTiposMateriais = checked
          ? [...(prev.tiposMateriais || []), materialValue]
          : (prev.tiposMateriais || []).filter(item => item !== materialValue);
        
        return { ...prev, tiposMateriais: updatedTiposMateriais };
      });
    } else {
      setTempDados(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }
      setImageFile(file);
      setRemoveImage(false);
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
      await axios.delete(`${API_URL}/usuario/conta`, {
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
        empresa: 'empresas/atualizar-localizacao',
        centro: 'centros-reciclagem/atualizar-localizacao'
      }[tipoUsuario];

      if (!endpoint) {
        alert("Tipo de usuário não suporta atualização de localização.");
        setSaving(false);
        return;
      }
      await axios.put(`${API_URL}/${endpoint}`, {
        localizacao: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)] // [longitude, latitude]
        }
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
      <VoltarLink to="/home">Voltar</VoltarLink>
      <div className="painel-header">
        <h2>Painel do {tipoUsuario === 'empresa' ? 'Empresa' : tipoUsuario === 'centro' ? 'Centro de Reciclagem' : 'Usuário'}</h2>
        <ActionButtons 
          editing={editing}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleCancel={handleCancel}
          saving={saving}
          setShowDeleteModal={setShowDeleteModal}
          tipoUsuario={tipoUsuario}
        />
      </div>

      <DeleteAccountModal 
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteAccount={handleDeleteAccount}
        deletingAccount={deletingAccount}
      />

      <div className="painel-content">
        <div className="profile-section">
          <ProfileImageUpload 
            imagePreview={imagePreview}
            editing={editing}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            tipoUsuario={tipoUsuario}
          />

          <ProfileInfoSection 
            tipoUsuario={tipoUsuario}
            dados={dados}
            tempDados={tempDados}
            editing={editing}
            setTempDados={setTempDados}
            handleInputChange={handleInputChange}
            
          />
        </div>

        <LocationSection 
          tipoUsuario={tipoUsuario}
          lat={lat}
          lng={lng}
          setLat={setLat}
          setLng={setLng}
          mapCenter={mapCenter}
          handleMapClick={handleMapClick}
          handleGetCurrentLocation={handleGetCurrentLocation}
          handleSaveLocation={handleSaveLocation}
          saving={saving}
          dados={dados}
        />
      </div>
    </div>
  );
};

export default PainelGenerico;