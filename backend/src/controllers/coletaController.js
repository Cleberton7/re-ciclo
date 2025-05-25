import Coleta from '../models/coletaModel.js';
import upload ,{configureUpload} from '../config/multerConfig.js';
import path from 'path';
import fs from 'fs';
const baseUrl = process.env.BASE_URL; 

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
      imagemPath = `coletas/${req.file.filename}`; // Caminho relativo padronizado
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
      ...novaColeta._doc,
      imagem: imagemPath // Envia apenas o caminho relativo
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

    const formatted = solicitacoes.map(coleta => ({
      ...coleta._doc,
      imagem: coleta.imagem // Mantém o caminho relativo
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted // <-- Usar dados formatados
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
      data: {
        ...coleta._doc,
        imagem: coleta.imagem ? `${process.env.BASE_URL}/uploads/${coleta.imagem}` : null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao aceitar coleta",
      error: error.message
    });
  }
};
export const atualizarColeta = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Primeiro busca a coleta existente
    const coletaExistente = await Coleta.findById(id);
    
    if (!coletaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Coleta não encontrada'
      });
    }

    if (req.file) {
      // Remove imagem antiga SE EXISTIR
      if (coletaExistente.imagem) {
        const oldImage = path.join(process.cwd(), 'uploads', coletaExistente.imagem);
        if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
      }
      updateData.imagem = path.join('coletas', req.file.filename);
    }

    // Atualiza após verificação
    const coletaAtualizada = await Coleta.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    ).populate('solicitante', 'nome email');

    res.json({
      success: true,
      message: 'Coleta atualizada com sucesso',
      data: {
        ...coletaAtualizada._doc,
        imagem: coletaAtualizada.imagem ? `${baseUrl}/uploads/${coletaAtualizada.imagem}` : null
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar coleta',
      error: error.message
    });
  }
};

