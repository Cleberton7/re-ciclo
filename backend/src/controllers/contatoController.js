import { sendContactEmail } from '../services/emailService.js';

export const enviarContato = async (req, res) => {
  try {
    const { nome, email, telefone, uf, cidade, assunto, mensagem } = req.body;
    await sendContactEmail({ nome, email, telefone, uf, cidade, assunto, mensagem });

    res.status(200).json({ 
      success: true,
      message: 'Mensagem enviada com sucesso' 
    });
  } catch (error) {
    console.error('Erro no endpoint de contato:', error);
    res.status(500).json({ 
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro ao processar sua mensagem'
    });
  }
};
