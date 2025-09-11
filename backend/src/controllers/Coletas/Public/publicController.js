import Coleta from '../../../models/coletaModel.js';
import { getPeriodoFilter } from '../../../services/filtroServices.js';

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

    // ATUALIZADO: Agora agrupa por tipoMaterial em vez de usar materiaisSeparados
    const resultado = await Coleta.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$tipoMaterial',
          quantidade: { $sum: '$quantidade' }
        }
      },
      {
        $project: {
          _id: 0,
          tipoMaterial: '$_id',
          quantidade: 1
        }
      }
    ]);

    // Formatar os dados para incluir todas as categorias, mesmo com quantidade zero
    const categorias = ['telefonia', 'informatica', 'eletrodomesticos', 'pilhas_baterias', 'outros'];
    
    const dados = categorias.map(categoria => {
      const encontrado = resultado.find(item => item.tipoMaterial === categoria);
      return {
        tipoMaterial: categoria,
        quantidade: encontrado ? encontrado.quantidade : 0
      };
    }).filter(item => item.quantidade > 0); // remove se for zero

    res.json({ success: true, data: dados });

  } catch (error) {
    console.error('Erro ao buscar distribuição de materiais:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
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