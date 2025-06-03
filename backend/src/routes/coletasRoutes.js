import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import Coleta from '../models/coletaModel.js';
import { createUploader, uploadErrorHandler } from '../config/multerConfig.js';

const router = express.Router();

// Configuração do upload para coletas
const coletaUpload = createUploader({
  subfolder: 'coletas',
  fieldName: 'imagem',
  allowedTypes: ['IMAGE'],
  maxFileSize: 5 * 1024 * 1024 // 5MB
});

// GET /api/coletas - Listar coletas com filtros
router.get('/', verifyToken, async (req, res) => {
  try {
    const { tipoMaterial, status } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipoUsuario;

    // Construir filtro baseado no tipo de usuário
    const filter = {};
    
    if (userType === 'coletor') {
      filter.$or = [
        { coletor: userId },
        { status: 'pendente' }
      ];
    } else {
      filter.solicitante = userId;
    }

    // Aplicar filtros adicionais
    if (tipoMaterial) filter.tipoMaterial = tipoMaterial;
    if (status) filter.status = status;

    // Popular informações dos relacionamentos
    const coletas = await Coleta.find(filter)
      .populate('solicitante', 'nome email telefone')
      .populate('coletor', 'nome email telefone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: coletas
    });

  } catch (error) {
    console.error('Erro ao buscar coletas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar coletas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/coletas - Criar nova solicitação de coleta
router.post('/', verifyToken, coletaUpload, uploadErrorHandler, async (req, res) => {
  try {
    const { tipoMaterial, quantidade, endereco, observacoes } = req.body;
    
    const novaColeta = await Coleta.create({
      solicitante: req.user.id,
      tipoMaterial,
      quantidade,
      endereco,
      observacoes,
      ...(req.file && { imagem: `/uploads/coletas/${req.file.filename}` })
    });

    res.status(201).json({
      success: true,
      message: 'Solicitação de coleta criada com sucesso',
      data: novaColeta
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar solicitação de coleta',
      error: error.message
    });
  }
});


export default router;