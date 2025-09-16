import User from "../models/User.js";
import path from 'path';
import fs from 'fs';

export const userController = {
  async getUserData(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao processar requisição"
      });
    }
  },

  async updateUserData(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Usuário não encontrado" 
        });
      }

      // Obter dados do form-data
      const {
        nome, 
        email, 
        endereco, 
        telefone,
        veiculo, 
        capacidadeColeta, 
        nomeFantasia,
        razaoSocial,
        removeImage,
        recebeResiduoComunidade,
        tiposMateriais // Novo campo: array de tipos de materiais
      } = req.body;

      const updateFields = {};

      // Campos comuns a todos os usuários
      if (nome) updateFields.nome = nome;
      if (email) updateFields.email = email;
      if (endereco) updateFields.endereco = endereco;
      if (telefone) updateFields.telefone = telefone.replace(/[^\d]+/g, '');

      // Tratamento da imagem
      if (req.file) {
        // Remover imagem antiga se existir
        if (user.imagemPerfil) {
          const oldImagePath = path.join(process.cwd(), 'uploads', user.imagemPerfil);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
        // Salvar caminho relativo da nova imagem
        updateFields.imagemPerfil = `users/profiles/${req.file.filename}`;
      } else if (removeImage === 'true') {
        // Remover imagem existente se solicitado
        if (user.imagemPerfil) {
          const oldImagePath = path.join(process.cwd(), 'uploads', user.imagemPerfil);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
          updateFields.imagemPerfil = null;
        }
      }

      // Campos específicos por tipo de usuário
      switch(user.tipoUsuario) {
        case "empresa":
          if (razaoSocial) updateFields.razaoSocial = razaoSocial;
          if (nomeFantasia) updateFields.nomeFantasia = nomeFantasia;
          
          // Atualizar recebeResiduoComunidade
          if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'recebeResiduoComunidade')) {
            updateFields.recebeResiduoComunidade = req.body.recebeResiduoComunidade === 'true';
            
            // Se a empresa parar de receber resíduos, limpar os tipos de materiais
            if (req.body.recebeResiduoComunidade === 'false') {
              updateFields.tiposMateriais = [];
            }
          }
          
          // Atualizar tipos de materiais (apenas se recebe resíduos)
          if (tiposMateriais !== undefined) {
            if (user.recebeResiduoComunidade || updateFields.recebeResiduoComunidade) {
              // Converter string JSON para array se necessário
              const materiaisArray = typeof tiposMateriais === 'string' 
                ? JSON.parse(tiposMateriais) 
                : tiposMateriais;
              
              updateFields.tiposMateriais = materiaisArray;
            } else {
              // Se não recebe resíduos, não pode ter tipos de materiais
              updateFields.tiposMateriais = [];
            }
          }
          break;
        
        case "centro":
          if (nomeFantasia) updateFields.nomeFantasia = nomeFantasia;
          if (veiculo) updateFields.veiculo = veiculo;
          if (capacidadeColeta) updateFields.capacidadeColeta = capacidadeColeta;
          
          // Atualizar tipos de materiais (obrigatório para centros)
          if (tiposMateriais !== undefined) {
            // Converter string JSON para array se necessário
            const materiaisArray = typeof tiposMateriais === 'string' 
              ? JSON.parse(tiposMateriais) 
              : tiposMateriais;
            
            updateFields.tiposMateriais = materiaisArray;
          }
          break;
        
        case "pessoa":
          // Campos específicos para pessoa física
          // Pessoas não têm tipos de materiais
          if (tiposMateriais !== undefined) {
            updateFields.tiposMateriais = [];
          }
          break;

        case "adminGeral":
          // Admins não têm tipos de materiais
          if (tiposMateriais !== undefined) {
            updateFields.tiposMateriais = [];
          }
          break;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateFields,
        { 
          new: true,
          runValidators: true 
        }
      ).select("-senha");

      // Formatar URL da imagem para resposta
      const userResponse = updatedUser.toObject();
      if (userResponse.imagemPerfil) {
        userResponse.imagemPerfil = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${userResponse.imagemPerfil}`;
      }

      return res.json({
        success: true,
        message: "Dados atualizados com sucesso",
        data: userResponse
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: "Erro de validação",
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        return res.status(400).json({
          success: false,
          message: "Formato inválido para tipos de materiais. Deve ser um array JSON válido."
        });
      }

      return res.status(500).json({ 
        success: false,
        message: "Erro ao atualizar dados",
        error: error.message 
      });
    }
  },
  async getPersonalData(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Usuário não encontrado" 
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Erro ao buscar dados pessoais"
      });
    }
  },

  async updateLocation(req, res) {
    try {
      const { lat, lng } = req.body;
  
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({
          success: false,
          message: "Latitude e longitude inválidas"
        });
      }
  
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { localizacao: { lat, lng } },
        { new: true }
      ).select('-senha');
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }
  
      return res.json({
        success: true,
        message: "Localização atualizada com sucesso",
        data: user
      });
  
    } catch (error) {
      console.error("Erro ao atualizar localização:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar localização"
      });
    }
  },

  async deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    
    // Primeiro encontre o usuário para pegar a imagem de perfil
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }

    // Remove a imagem de perfil se existir
    if (user.imagemPerfil) {
      const imagePath = path.join(__dirname, '../../uploads', user.imagemPerfil);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove o usuário do banco de dados
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Conta excluída com sucesso"
    });

  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao excluir conta"
    });
  }
  },
  async getTodosUsuarios(req, res){
  try {
    const usuarios = await User.find()
      .select('-senha -__v -emailVerificationToken');

    const usuariosCompletos = usuarios.map(user => {
      return {
        ...user._doc,
        nomeCompleto: user.nome || user.nomeFantasia || user.razaoSocial,
        documento: user.cpf || user.cnpj || user.documento || '',
      };
    });

    res.json({
      success: true,
      data: usuariosCompletos
    });
  } catch (error) {
    console.error("Erro ao buscar todos os usuários:", error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários'
    });
  }
  }
};


export default userController;