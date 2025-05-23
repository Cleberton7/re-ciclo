import React, { useState, useEffect } from 'react';
import './styles/painelNoticias.css'
import {
  listarNoticias,
  criarNoticia,
  atualizarNoticia,
  deletarNoticia
} from '../services/noticiaService';


const PainelNoticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', image: '', tags: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    carregarNoticias();
  }, []);

  const carregarNoticias = async () => {
    setLoading(true);
    try {
      const data = await listarNoticias();
      setNoticias(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const limparForm = () => {
    setForm({ title: '', content: '', image: '', tags: '' });
    setEditId(null);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!form.title || !form.content) {
      setError('Título e conteúdo são obrigatórios');
      return;
    }

    const noticiaData = {
      title: form.title,
      content: form.content,
      image: form.image,
      tags: form.tags ? form.tags.split(',').map(tag => tag.trim()) : []
    };

    try {
      if (editId) {
        await atualizarNoticia(editId, noticiaData);
        setSuccessMsg('Notícia atualizada com sucesso!');
      } else {
        await criarNoticia(noticiaData);
        setSuccessMsg('Notícia criada com sucesso!');
      }
      limparForm();
      carregarNoticias();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar notícia');
    }
  };

  const handleEditar = (noticia) => {
    setEditId(noticia._id);
    setForm({
      title: noticia.title,
      content: noticia.content,
      image: noticia.image || '',
      tags: noticia.tags ? noticia.tags.join(', ') : ''
    });
    setError('');
    setSuccessMsg('');
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Confirma a exclusão da notícia?')) return;
    try {
      await deletarNoticia(id);
      setSuccessMsg('Notícia deletada com sucesso!');
      carregarNoticias();
    } catch (err) {
      console.error(err);
      setError('Erro ao deletar notícia');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
      <h2>Painel de Notícias (admGeral)</h2>

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
          <label>Imagem (URL):</label><br />
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="URL da imagem"
            style={{ width: '100%' }}
          />
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
