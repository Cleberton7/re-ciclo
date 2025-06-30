import Coleta from '../../../models/coletaModel.js';
import { getImagePath, getFullImageUrl } from '../../../utils/fileHelper.js';


export const criarSolicitacao = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem foi enviada'
      });
    }

    const { tipoMaterial, quantidade, endereco, observacoes } = req.body;
    
    // Cria o caminho completo da imagem
    const imagemPath = `/uploads/coletas/${req.file.filename}`;

    const novaColeta = await Coleta.create({
      solicitante: req.user.id,
      tipoMaterial,
      quantidade,
      endereco,
      observacoes: observacoes || '',
      imagem: imagemPath,
      status: 'pendente',
      privacidade: 'publica'
    });

    res.status(201).json({
      success: true,
      data: {
        ...novaColeta.toObject(),
        imagem: `${req.protocol}://${req.get('host')}${imagemPath}`
      }
    });
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao criar solicitação'
    });
  }
};
export const getSolicitacoes = async (req, res) => {
  try {
    const { tipoMaterial, status } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipoUsuario;

    const filter = {};
    
    if (userType === 'centro') {
      filter.$or = [
        { centro: userId },
        { status: 'pendente' }
      ];
    } else {
      filter.solicitante = userId;
    }

    if (tipoMaterial) filter.tipoMaterial = tipoMaterial;
    if (status) filter.status = status;

    const solicitacoes = await Coleta.find(filter)
// No controller getSolicitacoes
      .populate('solicitante', 'nome email telefone nomeFantasia razaoSocial')
      .populate('centro', 'nome email telefone')
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
        centro: coletorId
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
        { centro: userId }
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

export const concluirColeta = async (req, res) => {
  try {
    const { id } = req.params;
    const { materiaisSeparados } = req.body;
    const userId = req.user.id;

    // Validação mínima
    if (!materiaisSeparados?.eletronicos?.quantidade) {
      return res.status(400).json({
        success: false,
        error: "Quantidade de eletrônicos é obrigatória"
      });
    }

    const coleta = await Coleta.findOneAndUpdate(
      {
        _id: id,
        centro: userId,
        status: 'aceita'
      },
      {
        status: 'concluída',
        dataConclusao: new Date(),
        materiaisSeparados
      },
      { new: true }
    ).populate('solicitante', 'nome email');

    if (!coleta) {
      return res.status(404).json({
        success: false,
        error: "Coleta não encontrada ou não autorizada"
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
    console.error('Erro ao concluir coleta:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro interno ao concluir coleta"
    });
  }
};