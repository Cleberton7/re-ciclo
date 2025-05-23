// /src/controllers/noticiaController.js
import Noticia from '../models/noticiaModel.js';

// Criar notícia
export const criarNoticia = async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const noticia = new Noticia({ title, slug, content, image, tags });
    const savedNoticia = await noticia.save();
    res.status(201).json(savedNoticia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Listar todas notícias
export const listarNoticias = async (req, res) => {
  try {
    const noticias = await Noticia.find().sort({ date: -1 });
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar notícia por slug
export const buscarNoticiaPorSlug = async (req, res) => {
  try {
    const noticia = await Noticia.findOne({ slug: req.params.slug });
    if (!noticia) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }
    res.json(noticia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar notícia
export const atualizarNoticia = async (req, res) => {
  try {
    const noticia = await Noticia.findById(req.params.id);
    if (!noticia) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }
    const { title, content, image, tags } = req.body;
    if (title) {
      noticia.title = title;
      noticia.slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    if (content) noticia.content = content;
    if (image) noticia.image = image;
    if (tags) noticia.tags = tags;

    const updated = await noticia.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deletar notícia
export const deletarNoticia = async (req, res) => {
  try {
    const noticia = await Noticia.findByIdAndDelete(req.params.id);
    if (!noticia) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }
    res.json({ message: 'Notícia deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
