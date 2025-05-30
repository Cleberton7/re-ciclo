import Coleta from '../models/coletaModel.js';
import { configureUpload } from '../config/multerConfig.js';
import upload from '../config/multerConfig.js';
import { getImageUrl } from '../utils/fileHelper.js';

// Middleware para upload de imagens de coleta
export const coletaUpload = [
  configureUpload('coletas'),
  upload.single('imagem')
];

// Criar solicitação de coleta (com imagem)
export const criarSolicitacao = async (req, res) => {
  try {
    const { tipoMaterial, quantidade, endereco, observacoes } = req.body;
    
    let imagemPath = null;
    if (req.file) {
      imagemPath = getImageUrl(req, req.file.filename);
    }

    const novaColeta = await Coleta.create({
      solicitante: req.user.id,
      tipoMaterial,
      quantidade,
      endereco,
      observacoes,
      imagem: imagemPath,
      status: 'pendente'
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
};

// Busca solicitações de coleta com filtros
export const getSolicitacoes = async (req, res) => {
  try {
    const { tipoMaterial, status } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipoUsuario;

    const filter = {};
    
    if (userType === 'coletor') {
      filter.$or = [
        { coletor: userId },
        { status: 'pendente' }
      ];
    } else {
      filter.solicitante = userId;
    }

    if (tipoMaterial) filter.tipoMaterial = tipoMaterial;
    if (status) filter.status = status;

    const solicitacoes = await Coleta.find(filter)
      .populate('solicitante', 'nome email telefone')
      .populate('coletor', 'nome email telefone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: solicitacoes.length,
      data: solicitacoes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar solicitações",
      error: error.message
    });
  }
};

// Aceitar uma coleta (para coletores)
export const aceitarColeta = async (req, res) => {
  try {
    const { id } = req.params;
    const coletorId = req.user.id;

    const coleta = await Coleta.findByIdAndUpdate(
      id,
      { 
        status: 'aceita',
        coletor: coletorId
      },
      { new: true }
    ).populate('solicitante', 'nome endereco');

    if (!coleta) {
      return res.status(404).json({
        success: false,
        message: "Solicitação não encontrada"
      });
    }

    res.json({
      success: true,
      message: "Coleta aceita com sucesso!",
      data: coleta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao aceitar coleta",
      error: error.message
    });
  }
};

// Atualizar coleta (com possibilidade de atualizar imagem)
export const atualizarColeta = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.imagem = getImageUrl(req, req.file.filename);
    }

    const coletaAtualizada = await Coleta.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    ).populate('solicitante', 'nome email');

    if (!coletaAtualizada) {
      return res.status(404).json({
        success: false,
        message: 'Coleta não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Coleta atualizada com sucesso',
      data: coletaAtualizada
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar coleta',
      error: error.message
    });
  }
};