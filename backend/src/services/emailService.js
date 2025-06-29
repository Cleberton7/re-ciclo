import { 
  EMAIL_CONFIG, 
  EMAIL_FROM,
  TEAM_EMAIL
} from '../config/config.js';
import nodemailer from 'nodemailer';

// Configura o Nodemailer
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Função genérica para enviar e-mails
const emailService = {
  send: async (to, subject, html) => {
    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject,
      html
    };
    return await transporter.sendMail(mailOptions);
  }
};

// Função específica para enviar e-mails de contato
export const sendContactEmail = async (contactData) => {
  const { nome, email, telefone, uf, cidade, assunto, mensagem } = contactData;
  
  const teamHtml = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #2e7d32;">Novo contato recebido</h2>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
      <p><strong>Localização:</strong> ${cidade ? `${cidade}/${uf}` : 'Não informado'}</p>
      <p><strong>Assunto:</strong> ${assunto}</p>
      <p><strong>Mensagem:</strong></p>
      <div style="white-space: pre-line; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
        ${mensagem}
      </div>
    </div>
  `;

  const clientHtml = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #2e7d32;">Recebemos sua mensagem, ${nome}!</h2>
      <p>Sua mensagem sobre <strong>${assunto}</strong> foi recebida com sucesso.</p>
      <p>Nossa equipe entrará em contato em breve.</p>
      <p><strong>Resumo:</strong></p>
      <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
        ${mensagem.substring(0, 150)}${mensagem.length > 150 ? '...' : ''}
      </div>
    </div>
  `;

  try {
    await Promise.all([
      emailService.send(TEAM_EMAIL, `Novo contato: ${assunto}`, teamHtml),
      emailService.send(email, `Confirmação de contato - ${assunto}`, clientHtml)
    ]);

    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mails:', error);
    throw new Error('Falha ao enviar e-mails');
  }
};

export default emailService;
