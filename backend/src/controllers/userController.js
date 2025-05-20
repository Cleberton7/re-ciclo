import User from "../models/User.js";

/**
 * Controller para operações relacionadas a usuários
 */
export const userController = {
  /**
   * Obtém dados básicos do usuário
   */
  async getUserData(req, res) {
    try {
      console.log('Usuário autenticado:', req.user);
      
      const user = await User.findById(req.user.id)
        .select('-senha -__v -createdAt -updatedAt');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      if (req.query.tipo && user.tipoUsuario !== req.query.tipo) {
        return res.status(403).json({
          success: false,
          message: `Acesso restrito para usuários do tipo ${req.query.tipo}`
        });
      }

      return res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return res.status(500).json({
        success: false,
        message: "Erro ao processar requisição"
      });
    }
  },

  /**
   * Atualiza dados do usuário
   */
  async updateUserData(req, res) {
    try {
      const { 
        nome, 
        email, 
        endereco, 
        cpf, 
        veiculo, 
        capacidadeColeta, 
        nomeFantasia, 
        cnpj, 
        tipoEmpresa 
      } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Usuário não encontrado" 
        });
      }

      const updateFields = {
        ...(nome && { nome }),
        ...(email && { email }),
        ...(endereco && { endereco })
      };

      switch(user.tipoUsuario) {
        case "empresa":
          Object.assign(updateFields, {
            ...(nomeFantasia && { nomeFantasia }),
            ...(cnpj && { cnpj }),
            ...(tipoEmpresa && { tipoEmpresa })
          });
          break;
        
        case "coletor":
          Object.assign(updateFields, {
            ...(veiculo && { veiculo }),
            ...(capacidadeColeta && { capacidadeColeta }),
            ...(cpf && { cpf })
          });
          break;
        
        default:
          if (cpf) updateFields.cpf = cpf;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateFields,
        { 
          new: true,
          runValidators: true 
        }
      ).select("-senha");

      return res.json({
        success: true,
        message: "Dados atualizados com sucesso",
        data: updatedUser
      });

    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: "Erro de validação",
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      return res.status(500).json({ 
        success: false,
        message: "Erro ao atualizar dados",
        error: error.message 
      });
    }
  },

  /**
   * Obtém dados específicos de pessoas físicas
   */
  async getPersonalData(req, res) {
    try {
      console.log('ID do usuário:', req.user.id); // Debug
      
      const user = await User.findOne({
        _id: req.user.id,
        tipoUsuario: "pessoa"
      }).select("-senha -__v");
  
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "Dados pessoais não encontrados" 
        });
      }
  
      return res.json({
        success: true,
        data: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          endereco: user.endereco,
          tipoUsuario: user.tipoUsuario
        }
      });
    } catch (error) {
      console.error("Erro ao buscar dados pessoais:", error);
      return res.status(500).json({ 
        success: false,
        message: "Erro ao buscar dados pessoais",
        error: error.message 
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
  }
  
};

export default userController;