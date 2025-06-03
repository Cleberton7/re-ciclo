import express from 'express';
import { verifyToken, checkUserType } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import { createUploader, uploadErrorHandler } from '../config/multerConfig.js';

const router = express.Router();

// Configuração do upload para empresas
const uploadEmpresa = createUploader({
  subfolder: 'empresas',
  fieldName: 'imagemPerfil',
  allowedTypes: ['IMAGE'],
  maxFileSize: 2 * 1024 * 1024 // 2MB
});
router.get('/dados', verifyToken, checkUserType(['empresa']), async (req, res) => {
  try {
    const empresa = await User.findById(req.user.id).select('-senha -__v -createdAt -updatedAt');
    if (!empresa) {
      return res.status(404).json({ success: false, message: 'Empresa não encontrada' });
    }
    res.json({
      success: true,
      data: {
        ...empresa._doc,
        nomeFantasia: empresa.razaoSocial || empresa.nome,
        documento: empresa.documento
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados da empresa',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/coletores-disponiveis', verifyToken, checkUserType(['empresa']), async (req, res) => {
  try {
    const coletores = await User.find({
      tipoUsuario: 'coletor',
      endereco: req.user.endereco
    }).select('nome email telefone veiculo capacidadeColeta');
    res.json({ success: true, data: coletores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar coletores' });
  }
});


router.put('/atualizar-localizacao', verifyToken, checkUserType(['empresa']), async (req, res) => {
  try {
    const { lat, lng } = req.body.localizacao;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: "Latitude e longitude são obrigatórios e devem ser números" });
    }

    await User.findByIdAndUpdate(req.user.id, { localizacao: { lat, lng } });
    res.json({ message: "Localização atualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar localização" });
  }
});

router.get('/localizacoes', async (req, res) => {
  try {
    const empresas = await User.find({ tipoUsuario: 'empresa', localizacao: { $ne: null } })
      .select('nome localizacao');
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar localizações das empresas" });
  }
});

router.get('/publicas', async (req, res) => {
  try {
    const empresas = await User.find({ tipoUsuario: 'empresa' })
      .select('nome email endereco cnpj razaoSocial telefone')
      .lean();
    res.json({
      success: true,
      data: empresas.map(e => ({
        ...e,
        nomeFantasia: e.razaoSocial || e.nome
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar empresas'
    });
  }
});

router.put(
  '/atualizar',
  verifyToken,
  checkUserType(['empresa']),
  uploadEmpresa,
  uploadErrorHandler,
  async (req, res) => {
    try {
      const updates = req.body;

      if (req.file) {
        updates.imagemPerfil = `/uploads/empresas/${req.file.filename}`;
      }

      const empresa = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-senha -__v');

      res.json({ 
        success: true,
        message: 'Dados atualizados com sucesso',
        data: empresa 
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
