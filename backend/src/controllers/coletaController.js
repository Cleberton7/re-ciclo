import Coleta from '../models/coletaModel.js';
import { getImagePath, getFullImageUrl } from '../utils/fileHelper.js';

export const criarSolicitacao = async (req, res) => {
  try {
    const { tipoMaterial, quantidade, endereco, observacoes } = req.body;
    
    const novaColeta = await Coleta.create({
      solicitante: req.user.id,
      tipoMaterial,
      quantidade,
      endereco,
      observacoes,
      imagem: req.file ? getImagePath(req, req.file.filename) : null,
      status: 'pendente'
    });

    res.status(201).json({
      success: true,
      data: {
        ...novaColeta.toObject(),
        imagem: getFullImageUrl(req, novaColeta.imagem)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Erro ao criar solicitação'
    });
  }
};

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
      .sort({ createdAt: -1 })
      .lean();

    const results = solicitacoes.map(coleta => ({
      ...coleta,
      imagem: getFullImageUrl(req, coleta.imagem)
    }));

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar solicitações'
    });
  }
};

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
      data: {
        ...coleta.toObject(),
        imagem: getFullImageUrl(req, coleta.imagem)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao aceitar coleta"
    });
  }
};

export const atualizarColeta = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.imagem = getImagePath(req, req.file.filename);
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
      data: {
        ...coletaAtualizada.toObject(),
        imagem: getFullImageUrl(req, coletaAtualizada.imagem)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Erro ao atualizar coleta'
    });
  }
};
export const deletarColeta = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.tipoUsuario;

    // Verifica se a coleta existe e pertence ao usuário
    const coleta = await Coleta.findOne({
      _id: id,
      $or: [
        { solicitante: userId },
        { coletor: userId }
      ]
    });

    if (!coleta) {
      return res.status(404).json({
        success: false,
        message: 'Coleta não encontrada ou você não tem permissão para excluí-la'
      });
    }

    // Verifica se a coleta pode ser deletada (apenas pendentes ou canceladas)
    if (!['pendente', 'cancelada'].includes(coleta.status)) {
      return res.status(400).json({
        success: false,
        message: 'Só é possível excluir coletas pendentes ou canceladas'
      });
    }

    await Coleta.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Coleta excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar coleta:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir coleta'
    });
  }
};