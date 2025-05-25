import React, { useState, useEffect ,useCallback } from 'react';
import './styles/painelNoticias.css';
import {
  listarNoticias,
  criarNoticia,
  atualizarNoticia,
  deletarNoticia
} from '../services/noticiaService';
import { useNavigate } from 'react-router-dom';

const PainelNoticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const carregarNoticias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarNoticias();
      setNoticias(data);
    } catch (err) {
      console.error('Erro ao carregar notícias:', err);
      setError('Erro ao carregar notícias');
      
      // Tratamento específico para token expirado/inválido
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]); // Dependências do useCallback

  useEffect(() => {
    const loadUser = () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        navigate('/login');
        return;
      }
      
      setUser(userData);
      
      if (userData.tipoUsuario !== 'admGeral') {
        setError('Acesso permitido apenas para administradores gerais');
        return;
      }
      
      carregarNoticias();
    };
    
    loadUser();
  }, [navigate, carregarNoticias]); // Dependências do useEffect

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const limparForm = () => {
    setForm({ title: '', content: '', tags: '' });
    setImageFile(null);
    setEditId(null);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!user || user.tipoUsuario !== 'admGeral') {
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
      formData.append('tags', form.tags ? JSON.stringify(form.tags.split(',').map(tag => tag.trim())) : JSON.stringify([]));
      
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
    if (!user || user.tipoUsuario !== 'admGeral') {
      setError('Acesso permitido apenas para administradores gerais');
      return;
    }
    
    setEditId(noticia._id);
    setForm({
      title: noticia.title,
      content: noticia.content,
      tags: noticia.tags ? noticia.tags.join(', ') : ''
    });
    setImageFile(null);
    setError('');
    setSuccessMsg('');
  };

  const handleDeletar = async (id) => {
    if (!user || user.tipoUsuario !== 'admGeral') {
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

  if (!user) {
    return <div>Carregando...</div>;
  }

  if (user.tipoUsuario !== 'admGeral') {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <h2>Acesso Restrito</h2>
        <p>Você precisa ser um administrador geral para acessar esta página.</p>
      </div>
    );
  }

  return (
<div style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
      <h2>Painel de Notícias (admGeral)</h2>
      <p>Usuário: {user.nome} ({user.tipoUsuario})</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
               <div>
          <label>Título:</label><br />
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label>Conteúdo:</label><br />
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={6}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label>Imagem:</label><br />
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imageFile && <p>Imagem selecionada: {imageFile.name}</p>}
        </div>

        <div>
          <label>Tags (separadas por vírgula):</label><br />
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" style={{ marginTop: '1rem' }}>
          {editId ? 'Atualizar Notícia' : 'Criar Notícia'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      </form>

      <hr />

      <h3>Notícias Cadastradas</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : noticias.length === 0 ? (
        <p>Nenhuma notícia encontrada.</p>
      ) : (
        <ul>
          {noticias.map(noticia => (
            <li key={noticia._id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
              <h4>{noticia.title}</h4>
              {noticia.image && (
                <img src={noticia.image} alt={noticia.title} style={{ maxWidth: 200, maxHeight: 120, objectFit: 'cover' }} />
              )}
              <p>{noticia.content.substring(0, 150)}...</p>
              <p><small>Tags: {noticia.tags.join(', ')}</small></p>
              <button onClick={() => handleEditar(noticia)} style={{ marginRight: '0.5rem' }}>
                Editar
              </button>
              <button onClick={() => handleDeletar(noticia._id)}>
                Deletar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PainelNoticias;
