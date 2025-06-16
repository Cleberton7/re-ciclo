import express from 'express';
import { 
  verifyToken, 
  requireAuth,
  requireRole 
} from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import createUploader, { uploadErrorHandler } from '../config/multerConfig.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';
import e from 'express';

const router = express.Router();
const requireCentro = requireRole(['centro']);

const uploadColetor = createUploader({
  subfolder: 'centros',
  fieldName: 'imagemPerfil',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxFileSize: 2 * 1024 * 1024 // 2MB
});


router.get('/dados', verifyToken, requireCentro, async (req, res) => {
  try {
    const centroReciclagem = await User.findById(req.user.id)
      .select('-senha -__v -createdAt -updatedAt -emailVerificationToken');

    if (!centroReciclagem) {
      return res.status(404).json({ 
        success: false,
        code: 'COLETOR_NOT_FOUND',
        message: 'Centro de reciclagem não encontrado' 
      });
    }

    res.json({
      success: true,
      data: {
        ...centroReciclagem._doc,
        nomeCompleto: centroReciclagem.nome || centroReciclagem.razaoSocial,
        documento: centroReciclagem.cnpj || centroReciclagem.cpf
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Erro ao buscar dados do centro de reciclagem',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get('/centros-disponiveis', 
  verifyToken, 
  requireCentro,
  rateLimiter(15, 5), // 15 requisições a cada 5 minutos
  async (req, res) => {
    try {
      const centros = await User.find({
        tipoUsuario: 'centro',
        endereco: req.user.endereco,
        emailVerificado: true
      }).select('nome email telefone imagemPerfil');

      res.json({ 
        success: true,
        data: centros 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        code: 'SERVER_ERROR',
        message: 'Erro ao buscar centros disponíveis',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);


router.put('/atualizar-localizacao', verifyToken, requireCentro, async (req, res) => {
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

router.get('/publicos', rateLimiter(30, 60), async (req, res) => {
  try {
    const centros = await User.find({ 
      tipoUsuario: 'centro',
    })
    .select('nome email endereco cnpj telefone nomeFantasia imagemPerfil')
    .lean();
      
    res.json({ 
      success: true,
      data: centros 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      code: 'SERVER_ERROR',
      message: 'Erro ao buscar centros de reciclagem' 
    });
  }
});


router.get('/localizacoes', async (req, res) => {
  try {
    const centros = await User.find({ tipoUsuario: 'centro', localizacao: { $ne: null } })
      .select('nome localizacao');

    res.json(centros);
  } catch (error) {
    console.error('Erro ao buscar localizações dos centros de reciclagem:', error);
    res.status(500).json({ message: "Erro ao buscar localizações dos centros de reciclagem" });
  }
});


router.put(
  '/atualizar',
  verifyToken,
  requireCentro,
  uploadColetor,
  uploadErrorHandler,
  async (req, res) => {
    try {
      const allowedUpdates = ['nome', 'telefone', 'endereco'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      if (req.file) {
        updates.imagemPerfil = `/uploads/centros-reciclagem/${req.file.filename}`;
      }

      const centroReciclagem = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-senha -__v -emailVerificationToken');

      res.json({ 
        success: true,
        message: 'Dados atualizados com sucesso',
        data: centroReciclagem 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Erro ao atualizar dados',
        details: error.message 
      });
    }
  }
);

export default router;


