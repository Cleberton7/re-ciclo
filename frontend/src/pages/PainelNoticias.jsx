import React, { useState, useEffect, useCallback, useContext } from 'react';
import './styles/painelNoticias.css';
import {
  listarNoticias,
  criarNoticia,
  atualizarNoticia,
  deletarNoticia
} from '../services/noticiaService';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const PainelNoticias = () => {
  const { userData: user, role } = useContext(AuthContext);
  const [noticias, setNoticias] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const carregarNoticias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarNoticias();
      // Garante que todas as imagens tenham URLs completas
      const noticiasComImagens = data.map(noticia => ({
        ...noticia,
        image: noticia.image && !noticia.image.startsWith('http') 
          ? `${ 'http://localhost:5000'}${noticia.image}`
          : noticia.image
      }));
      setNoticias(noticiasComImagens);
    } catch (err) {
      console.error('Erro ao carregar notícias:', err);
      setError('Erro ao carregar notícias');

      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (role === 'adminGeral') {
      carregarNoticias();
    }
  }, [role, carregarNoticias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const limparForm = () => {
    setForm({ title: '', content: '', tags: '' });
    setImageFile(null);
    setPreviewImage(null);
    setEditId(null);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (role !== 'adminGeral') {
      setError('Acesso permitido apenas para administradores gerais');
      return;
    }

    if (!form.title || !form.content) {
      setError('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append(
        'tags',
        form.tags ? JSON.stringify(form.tags.split(',').map(tag => tag.trim())) : JSON.stringify([])
      );

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editId) {
        await atualizarNoticia(editId, formData);
        setSuccessMsg('Notícia atualizada com sucesso!');
      } else {
        await criarNoticia(formData);
        setSuccessMsg('Notícia criada com sucesso!');
      }

      limparForm();
      await carregarNoticias();

    } catch (err) {
      console.error('Erro ao salvar notícia:', err);

      if (err.response?.status === 403) {
        setError('Acesso negado. Verifique suas permissões.');
      } else if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Erro ao salvar notícia');
      }
    }
  };

  const handleEditar = (noticia) => {
    if (role !== 'adminGeral') {
      setError('Acesso permitido apenas para administradores gerais');
      return;
    }

    setEditId(noticia._id);
    setForm({
      title: noticia.title,
      content: noticia.content,
      tags: noticia.tags ? noticia.tags.join(', ') : ''
    });
    
    // Configura a pré-visualização da imagem existente
    setPreviewImage(noticia.image || null);
    setImageFile(null);
    setError('');
    setSuccessMsg('');
  };

  const handleDeletar = async (id) => {
    if (role !== 'adminGeral') {
      setError('Acesso permitido apenas para administradores gerais');
      return;
    }

    if (!window.confirm('Confirma a exclusão da notícia?')) return;

    try {
      await deletarNoticia(id);
      setSuccessMsg('Notícia deletada com sucesso!');
      await carregarNoticias();
    } catch (err) {
      console.error('Erro ao deletar notícia:', err);

      if (err.response?.status === 403) {
        setError('Acesso negado. Verifique suas permissões.');
      } else if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Erro ao deletar notícia');
      }
    }
  };

  if (role !== 'adminGeral') {
    return (
      <div className="painel-noticias-container">
        <h2>Acesso Restrito</h2>
        <p>Você precisa ser um administrador geral para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="painel-noticias-container" id='containerPrincipal'>
      <h3>Painel de Notícias</h3>
      <div className='formNoticia'>

        <p className="user-info">Usuário: {user?.nome} ({role})</p>

        <form onSubmit={handleSubmit} >
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Conteúdo:</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={6}
            />
          </div>

          <div className="form-group">
            <label>Imagem:</label>
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              onChange={handleImageChange}
            />
            {(previewImage || imageFile) && (
              <div className="image-preview">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/imagem-padrao.jpg';
                  }}
                />
                {imageFile && <p>Arquivo selecionado: {imageFile.name}</p>}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Tags (separadas por vírgula):</label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <button type="submit" className="submit-button">
            {editId ? 'Atualizar Notícia' : 'Criar Notícia'}
          </button>

          {error && <p className="error-message">{error}</p>}
          {successMsg && <p className="success-message">{successMsg}</p>}
        </form>
      </div>

      <div className="noticias-list">
        <h3>Notícias Cadastradas</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : noticias.length === 0 ? (
          <p>Nenhuma notícia encontrada.</p>
        ) : (
          <ul>
            {noticias.map(noticia => (
              <li key={noticia._id} className="noticia-item">
                <div className="noticia-image">
                  {noticia.image && (
                    <img 
                      src={noticia.image} 
                      alt={noticia.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/imagem-padrao.jpg';
                      }}
                    />
                  )}
                </div>
                <div className="noticia-content">
                  <h4>{noticia.title}</h4>
                  <p>{noticia.content.substring(0, 150)}...</p>
                  <p className="noticia-tags"><small>Tags: {noticia.tags?.join(', ') || 'Nenhuma'}</small></p>
                  <div className="noticia-actions">
                    <button onClick={() => handleEditar(noticia)} className="edit-button">
                      Editar
                    </button>
                    <button onClick={() => handleDeletar(noticia._id)} className="delete-button">
                      Deletar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PainelNoticias;