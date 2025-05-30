import express from 'express';
import Coleta from '../models/coletaModel.js';
import User from '../models/User.js';

const router = express.Router();

// Endpoint: /api/public/coletas
router.get('/coletas', async (req, res) => {
  try {
    const { tipoMaterial, periodo, limit } = req.query;
    
    const filter = { status: 'concluída' };
    if (tipoMaterial) filter.tipoMaterial = tipoMaterial;

    // Filtro por período
    if (periodo === 'mensal') {
      filter.dataColeta = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      };
    } else if (periodo === 'trimestral') {
      filter.dataColeta = {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
      };
    } else if (periodo === 'anual') {
      filter.dataColeta = {
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      };
    }

    const coletas = await Coleta.find(filter)
      .populate('solicitante', 'nome razaoSocial')
      .sort({ dataColeta: -1 })
      .limit(Number(limit) || 6);

    res.json({
      success: true,
      data: coletas.map(c => ({
        ...c._doc,
        empresaNome: c.solicitante?.razaoSocial || c.solicitante?.nome || 'Não informado'
      }))
    });
  } catch (error) {
    console.error('Erro em /public/coletas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar coletas públicas'
    });
  }
});

// Endpoint: /api/public/ranking
router.get('/ranking', async (req, res) => {
  try {
    const { periodo, limit } = req.query;
    
    let dateFilter = {};
    if (periodo === 'mensal') {
      dateFilter.$gte = new Date(new Date().setDate(new Date().getDate() - 30));
    } else if (periodo === 'trimestral') {
      dateFilter.$gte = new Date(new Date().setMonth(new Date().getMonth() - 3));
    } else if (periodo === 'anual') {
      dateFilter.$gte = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    }

    const ranking = await Coleta.aggregate([
      {
        $match: {
          status: 'concluída',
          ...(Object.keys(dateFilter).length ? { dataColeta: dateFilter } : {})
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'solicitante',
          foreignField: '_id',
          as: 'empresa'
        }
      },
      { $unwind: '$empresa' },
      {
        $group: {
          _id: '$empresa._id',
          nome: { $first: '$empresa.razaoSocial' || '$empresa.nome' },
          totalColetado: { $sum: '$quantidade' },
          coletasConcluidas: { $sum: 1 }
        }
      },
      { $sort: { totalColetado: -1 } },
      { $limit: parseInt(limit) || 10 }
    ]);

    res.json({ 
      success: true,
      data: ranking 
    });
  } catch (error) {
    console.error('Erro em /public/ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar ranking'
    });
  }
});

// Endpoint: /api/public/estatisticas
router.get('/estatisticas', async (req, res) => {
  try {
    const [totalColetado, empresasAtivas] = await Promise.all([
      Coleta.aggregate([
        { $match: { status: 'concluída' } },
        { $group: { _id: null, total: { $sum: '$quantidade' } } }
      ]),
      User.countDocuments({ tipoUsuario: 'empresa' })
    ]);

    res.json({
      success: true,
      data: {
        totalColetado: totalColetado[0]?.total || 0,
        empresasAtivas: empresasAtivas || 0,
        impactoAmbiental: Math.floor((totalColetado[0]?.total || 0) / 100)
      }
    });
  } catch (error) {
    console.error('Erro em /public/estatisticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});
// Endpoint: /api/public/distribuicao
router.get('/distribuicao', async (req, res) => {
  try {
    const distribuicao = await Coleta.aggregate([
      { $match: { status: 'concluída' } },
      {
        $group: {
          _id: '$tipoMaterial',
          total: { $sum: '$quantidade' },
          count: { $sum: 1 }
        }
      },
      { 
        $project: {
          tipoMaterial: '$_id',
          total: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: distribuicao
    });
  } catch (error) {
    console.error('Erro em /public/distribuicao:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar distribuição de materiais'
    });
  }
});
export default router;