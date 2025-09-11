import Coleta from '../models/coletaModel.js';
import { getImagePath, getFullImageUrl } from '../utils/fileHelper.js';
import { getPeriodoFilter } from '../services/filtroServices.js';


export const criarSolicitacao = async (req, res) => {
  try {
    const { tipoMaterial, quantidade, endereco, observacoes, privacidade } = req.body;
    
    // Validação das categorias
    const categoriasValidas = ['telefonia', 'informatica', 'eletrodomesticos', 'pilhas_baterias', 'outros'];
    if (!categoriasValidas.includes(tipoMaterial)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de material inválido'
      });
    }

    let imagemPath = null;
    if (req.file) {
      imagemPath = `/uploads/coletas/${req.file.filename}`;
    }

    const novaColeta = await Coleta.create({
      solicitante: req.user.id,
      tipoMaterial,
      quantidade,
      endereco,
      observacoes: observacoes || '',
      imagem: imagemPath,
      status: 'pendente',
      privacidade: privacidade || 'publica'
    });

    res.status(201).json({
      success: true,
      data: {
        ...novaColeta.toObject(),
        imagem: imagemPath ? `${req.protocol}://${req.get('host')}${imagemPath}` : null
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


export const getEvolucaoColetas = async (req, res) => {
  try {
    const { periodo = 'mensal' } = req.query;
    
    // Define o intervalo de datas baseado no período
    const now = new Date();
    let startDate;
    
    switch(periodo) {
      case 'mensal':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'trimestral':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'anual':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default: // 'total'
        startDate = new Date(0); // Data mínima
    }

    // Agrega os dados por mês
    const evolucao = await Coleta.aggregate([
      {
        $match: {
          status: 'concluída',
          privacidade: 'publica',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$quantidade" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          periodo: { 
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          total: 1
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: evolucao.length > 0 ? evolucao : [] 
    });
  } catch (error) {
    console.error('Erro ao buscar evolução:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar dados de evolução' 
    });
  }
};


export const getColetasPublicas = async (req, res) => {
  try {
    const { tipoMaterial, periodo = 'mensal', limit = 6 } = req.query;

    const filtroData = getPeriodoFilter(periodo);

    const query = {
      status: 'concluída',
      privacidade: 'publica',
      ...(tipoMaterial ? { tipoMaterial } : {}),
      ...filtroData,
    };

    const coletas = await Coleta.find(query)
      .populate('solicitante', 'razaoSocial nomeFantasia')
      .sort({ dataSolicitacao: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: coletas });
  } catch (error) {
    console.error('Erro ao buscar coletas públicas:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar coletas públicas' });
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
    const { periodo = 'total' } = req.query;

    const now = new Date();
    let dateFilter = {};

    if (periodo !== 'total') {
      if (periodo === 'mensal') {
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) };
      } else if (periodo === 'trimestral') {
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()) };
      } else if (periodo === 'anual') {
        dateFilter = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) };
      }
    }

    const matchStage = {
      status: 'concluída',
      privacidade: 'publica',
      ...(periodo !== 'total' ? { createdAt: dateFilter } : {})
    };

    const resultado = await Coleta.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          eletronicos: { $sum: { $ifNull: ['$materiaisSeparados.eletronicos.quantidade', 0] } },
          metais: { $sum: { $ifNull: ['$materiaisSeparados.metais.quantidade', 0] } },
          plasticos: { $sum: { $ifNull: ['$materiaisSeparados.plasticos.quantidade', 0] } }
        }
      }
    ]);

    if (!resultado.length) {
      return res.json({ success: true, data: [] });
    }

    const dados = [
      { tipoMaterial: 'eletronicos', quantidade: resultado[0].eletronicos },
      { tipoMaterial: 'metais', quantidade: resultado[0].metais },
      { tipoMaterial: 'plasticos', quantidade: resultado[0].plasticos }
    ].filter(item => item.quantidade > 0); // remove se for zero

    res.json({ success: true, data: dados });

  } catch (error) {
    console.error('Erro ao buscar distribuição de materiais:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};


export const getRankingEmpresas = async (req, res) => {
  try {
    const { periodo = 'total' } = req.query;

    const now = new Date();
    let dateFilter = null;

    if (periodo !== 'total') {
      if (periodo === 'mensal') {
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) };
      } else if (periodo === 'trimestral') {
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()) };
      } else if (periodo === 'anual') {
        dateFilter = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) };
      }
    }

    const matchStage = {
      status: 'concluída',
      privacidade: 'publica',
      ...(dateFilter ? { createdAt: dateFilter } : {})
    };

    const ranking = await Coleta.aggregate([
      { $match: matchStage },
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

    res.json({ success: true, data: ranking });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};
