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
    //console.log('📤 Arquivo recebido:', req.file); 
    //console.log('📦 Campos recebidos:', req.body);
      const { 
        nome, 
        email, 
        endereco, 
        cpf, 
        telefone,
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
        ...(endereco && { endereco }),
        ...(telefone && { telefone: telefone.replace(/[^\d]+/g, '') })
      };

      // Tratamento da imagem
      if (req.file) {
        //console.log('🔄 Atualizando imagem:', `users/${req.file.filename}`);
        // Remover imagem antiga se existir
        if (user.imagemPerfil) {
          const oldImagePath = path.join(process.cwd(), 'uploads', user.imagemPerfil);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
        // Armazenar caminho relativo universal (substitua path.join)
        updateFields.imagemPerfil = `users/${req.file.filename}`; // <-- Linha modificada
      }

      // Campos específicos por tipo de usuário
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

      // Formatar URL da imagem
      if (updatedUser.imagemPerfil) {
        updatedUser.imagemPerfil = `${process.env.BASE_URL}/uploads/${updatedUser.imagemPerfil}`;
      }

      return res.json({
        success: true,
        message: "Dados atualizados com sucesso",
        data: updatedUser
      });
    //console.log('✅ Usuário atualizado:', updatedUser);
    } catch (error) {
    console.error('❌ Erro crítico:', error);
      
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
  }
};

export default userController;