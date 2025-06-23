import Coleta from '../models/coletaModel.js';
import { getImagePath, getFullImageUrl } from '../utils/fileHelper.js';

export const criarSolicitacao = async (req, res) => {
  try {
    // No controller, adicione temporariamente:
    console.log('Arquivo recebido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
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
      .populate('solicitante', 'nome email telefone')
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
// Adicione estas novas funções ao seu controller
export const getColetasPublicas = async (req, res) => {
  try {
    const { tipoMaterial, periodo, limit } = req.query;
    
    const filter = { 
      $or: [
        { status: 'concluída', privacidade: 'publica' },
        // Inclui coletas antigas que não tinham o campo privacidade
        { status: 'concluída', privacidade: { $exists: false } }
      ]
    };
    if (tipoMaterial) filter.tipoMaterial = tipoMaterial;
    
    // Filtro por período
    if (periodo) {
      const dateFilter = {};
      const now = new Date();
      
      if (periodo === 'mensal') {
        dateFilter.$gte = new Date(now.setMonth(now.getMonth() - 1));
      } else if (periodo === 'trimestral') {
        dateFilter.$gte = new Date(now.setMonth(now.getMonth() - 3));
      } else if (periodo === 'anual') {
        dateFilter.$gte = new Date(now.setFullYear(now.getFullYear() - 1));
      }
      
      filter.createdAt = dateFilter;
    }

    const coletas = await Coleta.find(filter)
      .limit(parseInt(limit) || 6)
      .populate('solicitante', 'nomeFantasia razaoSocial')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: coletas.map(c => ({
        ...c,
        imagem: getFullImageUrl(req, c.imagem)
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar coletas públicas:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

export const getEstatisticasPublicas = async (req, res) => {
  try {
    // Total coletado
    const totalColetado = await Coleta.aggregate([
      { $match: { status: 'concluída', privacidade: 'publica' } },
      { $group: { _id: null, total: { $sum: '$quantidade' } } }
    ]);
    
    // Empresas ativas
    const empresasAtivas = await Coleta.distinct('solicitante', {
      status: 'concluída',
      privacidade: 'publica'
    });
    
    // Impacto ambiental (exemplo: 1kg = 0.5kg de CO2 evitado)
    const impacto = totalColetado[0]?.total * 0.5 || 0;

    res.json({
      success: true,
      data: {
        totalColetado: totalColetado[0]?.total || 0,
        empresasAtivas: empresasAtivas.length || 0,
        impactoAmbiental: impacto
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

export const getDistribuicaoMateriais = async (req, res) => {
  try {
    const distribuicao = await Coleta.aggregate([
      { $match: { status: 'concluída', privacidade: 'publica' } },
      { $group: { 
        _id: '$tipoMaterial', 
        total: { $sum: '$quantidade' } 
      }},
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: distribuicao.map(item => ({
        tipoMaterial: item._id,
        total: item.total
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar distribuição:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};

export const getRankingEmpresas = async (req, res) => {
  try {
    const { periodo } = req.query;
    
    const dateFilter = {};
    if (periodo) {
      const now = new Date();
      
      if (periodo === 'mensal') {
        dateFilter.$gte = new Date(now.setMonth(now.getMonth() - 1));
      } else if (periodo === 'trimestral') {
        dateFilter.$gte = new Date(now.setMonth(now.getMonth() - 3));
      } else if (periodo === 'anual') {
        dateFilter.$gte = new Date(now.setFullYear(now.getFullYear() - 1));
      }
    }

    const ranking = await Coleta.aggregate([
      { 
        $match: { 
          status: 'concluída',
          privacidade: 'publica',
          ...(periodo && { createdAt: dateFilter })
        } 
      },
      { 
        $group: { 
          _id: '$solicitante',
          totalColetado: { $sum: '$quantidade' },
          coletasConcluidas: { $sum: 1 }
        } 
      },
      { $sort: { totalColetado: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'empresa'
        }
      },
      { $unwind: '$empresa' },
      {
        $project: {
          _id: 0,
          idEmpresa: '$_id',
          nomeFantasia: '$empresa.nomeFantasia',
          razaoSocial: '$empresa.razaoSocial',
          totalColetado: 1,
          coletasConcluidas: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: ranking
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};
export const concluirColeta = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coleta = await Coleta.findByIdAndUpdate(
      id,
      { 
        status: 'concluída',
        dataColeta: new Date() 
      },
      { new: true }
    ).populate('solicitante', 'nome email');

    if (!coleta) {
      return res.status(404).json({
        success: false,
        message: "Coleta não encontrada"
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
      error: "Erro ao concluir coleta"
    });
  }
};