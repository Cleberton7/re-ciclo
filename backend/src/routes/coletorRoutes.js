import express from 'express';
import { verifyToken, checkUserType } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import createUploader, { uploadErrorHandler } from '../config/multerConfig.js';


const router = express.Router();

// Configuração do upload para coletores
const uploadColetor = createUploader({
  subfolder: 'coletores',
  fieldName: 'imagemPerfil',
  allowedTypes: ['IMAGE']
});

// GET dados do coletor logado
router.get('/dados', verifyToken, checkUserType(['coletor']), async (req, res) => {
  try {
    const coletor = await User.findById(req.user.id).select('-senha -__v -createdAt -updatedAt');

    if (!coletor) {
      return res.status(404).json({ success: false, message: 'Coletor não encontrado' });
    }

    res.json({
      success: true,
      data: {
        ...coletor._doc,
        nomeCompleto: coletor.nome || coletor.razaoSocial,
        documento: coletor.documento
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do coletor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do coletor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET centros disponíveis para coleta (exemplo de rota específica para coletor)
router.get('/centros-disponiveis', verifyToken, checkUserType(['coletor']), async (req, res) => {
  try {
    const centros = await User.find({
      tipoUsuario: 'centro',
      endereco: req.user.endereco
    }).select('nome email telefone capacidadeRecepcao');

    res.json({ success: true, data: centros });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar centros disponíveis' });
  }
});


// PUT atualizar localização do coletor
router.put('/atualizar-localizacao', verifyToken, checkUserType(['coletor']), async (req, res) => {
  try {
    const { lat, lng } = req.body.localizacao;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: "Latitude e longitude são obrigatórios e devem ser números" });
    }

    await User.findByIdAndUpdate(req.user.id, { localizacao: { lat, lng } });

    res.json({ message: "Localização atualizada com sucesso" });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    res.status(500).json({ message: "Erro ao atualizar localização" });
  }
});

// GET lista pública de coletores
router.get('/publicos', async (req, res) => {
  try {
    const coletores = await User.find({ tipoUsuario: 'coletor' })
      .select('nome email endereco telefone veiculo capacidadeColeta')
      .lean();
      
    res.json({ success: true, data: coletores });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar coletores' 
    });
  }
});

// GET localizações de coletores para exibição no mapa
router.get('/localizacoes', async (req, res) => {
  try {
    const coletores = await User.find({ tipoUsuario: 'coletor', localizacao: { $ne: null } })
      .select('nome localizacao');

    res.json(coletores);
  } catch (error) {
    console.error('Erro ao buscar localizações dos coletores:', error);
    res.status(500).json({ message: "Erro ao buscar localizações dos coletores" });
  }
});
// Substitua a rota PUT /atualizar existente por:
router.put(
  '/atualizar',
  verifyToken,
  checkUserType(['coletor']),
  uploadColetor,
  uploadErrorHandler,
  async (req, res) => {
    try {
      const updates = req.body;

      if (req.file) {
        updates.imagemPerfil = `/uploads/coletores/${req.file.filename}`;
      }

      const coletor = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-senha -__v');

      res.json({ 
        success: true,
        message: 'Dados atualizados com sucesso',
        data: coletor 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar dados', 
        error: error.message 
      });
    }
  }
);

export default router;
