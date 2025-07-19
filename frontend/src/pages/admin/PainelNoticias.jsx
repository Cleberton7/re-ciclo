import React, { useState, useEffect, useCallback, useContext } from 'react';
import '../styles/painelNoticias.css';
import {
  listarNoticias,
  criarNoticia,
  atualizarNoticia,
  deletarNoticia
} from '../../services/noticiaService';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { BASE_URL } from '../../config/config.js';

const ITENS_POR_PAGINA = 4;

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
  const [termoBusca, setTermoBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const navigate = useNavigate();

  const carregarNoticias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarNoticias();

      const noticiasComImagens = data.map(noticia => ({
        ...noticia,
        image: noticia.image && !noticia.image.startsWith('http') 
          ? `${BASE_URL}${noticia.image}`
          : noticia.image
      }));
      setNoticias(noticiasComImagens);
      setError('');
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

  // Filtra as notícias pelo termo de busca (título e tags)
  const noticiasFiltradas = noticias.filter(n => {
    const busca = termoBusca.toLowerCase();
    const titulo = n.title.toLowerCase();
    const tags = n.tags ? n.tags.join(', ').toLowerCase() : '';
    return titulo.includes(busca) || tags.includes(busca);
  });

  // Paginação
  const totalPaginas = Math.ceil(noticiasFiltradas.length / ITENS_POR_PAGINA);
  const indiceUltimo = paginaAtual * ITENS_POR_PAGINA;
  const indicePrimeiro = indiceUltimo - ITENS_POR_PAGINA;
  const noticiasPagina = noticiasFiltradas.slice(indicePrimeiro, indiceUltimo);

  const handleProxima = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  const handleAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  if (role !== 'adminGeral') {
    return (
      <div className="news-panel news-panel--restricted">
        <h2>Acesso Restrito</h2>
        <p>Você precisa ser um administrador geral para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="news-panel" id='containerPrincipal'>
      <h3 className="news-panel__title">Painel de Notícias</h3>

      <p className="news-panel__user-info">Usuário: {user?.nome} ({role})</p>

      <div className='news-form'>
        <form onSubmit={handleSubmit}>
          <div className="news-form__group">
            <label className="news-form__label">Título:</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="news-form__input"
            />
          </div>

          <div className="news-form__group">
            <label className="news-form__label">Conteúdo:</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={6}
              className="news-form__textarea"
            />
          </div>

          <div className="news-form__group">
            <label className="news-form__label">Imagem:</label>
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              onChange={handleImageChange}
              className="news-form__file-input"
            />
            {(previewImage || imageFile) && (
              <div className="news-form__image-preview">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="news-form__preview-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/imagem-padrao.jpg';
                  }}
                />
                {imageFile && <p className="news-form__file-info">Arquivo selecionado: {imageFile.name}</p>}
              </div>
            )}
          </div>

          <div className="news-form__group">
            <label className="news-form__label">Tags (separadas por vírgula):</label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="tag1, tag2, tag3"
              className="news-form__input"
            />
          </div>

          <div className="news-form__buttons">
            <button type="submit" className="news-form__submit">
              {editId ? 'Atualizar Notícia' : 'Criar Notícia'}
            </button>

            <button
              type="button"
              className="news-form__clear"
              onClick={limparForm}
            >
              Limpar Formulário
            </button>
          </div>

          {error && <p className="news-form__message--error">{error}</p>}
          {successMsg && <p className="news-form__message--success">{successMsg}</p>}
        </form>
      </div>

      <div className="news-list">
        <h3 className="news-list__title">Notícias Cadastradas</h3>
        <div className="news-list__search-container">
          <input
            type="text"
            className="news-list__search"
            placeholder="🔎 Buscar por título ou tag..."
            value={termoBusca}
            onChange={(e) => {
              setTermoBusca(e.target.value);
              setPaginaAtual(1);
            }}
          />
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p className="news-form__message--error">{error}</p>
        ) : noticiasPagina.length === 0 ? (
          <p>Nenhuma notícia encontrada.</p>
        ) : (
          <>
            <ul>
              {noticiasPagina.map(noticia => (
                <li key={noticia._id} className="news-item">
                  <div className="news-item__image-container">
                    {noticia.image && (
                      <img 
                        src={noticia.image} 
                        alt={noticia.title}
                        className="news-item__image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/imagem-padrao.jpg';
                        }}
                      />
                    )}
                  </div>
                  <div className="news-item__content">
                    <h4 className="news-item__title">{noticia.title}</h4>
                    <p className="news-item__text">{noticia.content.substring(0, 150)}...</p>
                    <p className="news-item__tags"><small>Tags: {noticia.tags?.join(', ') || 'Nenhuma'}</small></p>
                    <div className="news-item__actions">
                      <button onClick={() => handleEditar(noticia)} className="news-item__edit" title="✏️ Editar">
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleDeletar(noticia._id)} className="news-item__delete" title="🗑️ Deletar">
                        🗑️ Deletar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="news-pagination">
              <button onClick={handleAnterior} disabled={paginaAtual === 1} className="news-pagination__button">Anterior</button>
              <span>Página {paginaAtual} de {totalPaginas}</span>
              <button onClick={handleProxima} disabled={paginaAtual === totalPaginas} className="news-pagination__button">Próxima</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PainelNoticias;