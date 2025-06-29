import { 
  EMAIL_PROVIDER, 
  SENDGRID_API_KEY, 
  EMAIL_CONFIG, 
  EMAIL_FROM,
  TEAM_EMAIL
} from '../config/config.js';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Configura o provedor de e-mail
let emailService;
if (EMAIL_PROVIDER === 'sendgrid' && SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  emailService = {
    send: async (to, subject, html) => {
      const msg = {
        to,
        from: EMAIL_FROM,
        subject,
        html,
        mailSettings: {
          sandboxMode: {
            enable: process.env.NODE_ENV === 'test'
          }
        }
      };
      return await sgMail.send(msg);
    }
  };
} else {
  const transporter = nodemailer.createTransport(EMAIL_CONFIG);
  emailService = {
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
}

// Função para enviar e-mails de contato
export const sendContactEmail = async (contactData) => {
  const { nome, email, telefone, uf, cidade, assunto, mensagem } = contactData;
  
  // E-mail para a equipe
  const teamHtml = `
    <h2>Novo contato recebido</h2>
    <p><strong>Nome:</strong> ${nome}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
    <p><strong>Localização:</strong> ${cidade ? `${cidade}/${uf}` : 'Não informado'}</p>
    <p><strong>Assunto:</strong> ${assunto}</p>
    <p><strong>Mensagem:</strong></p>
    <div style="white-space: pre-line;">${mensagem}</div>
  `;

  // E-mail de confirmação para o cliente
  const clientHtml = `
    <h2>Recebemos sua mensagem, ${nome}!</h2>
    <p>Sua mensagem sobre <strong>${assunto}</strong> foi recebida com sucesso.</p>
    <p>Nossa equipe entrará em contato em breve.</p>
    <p><strong>Resumo:</strong></p>
    <div style="font-style: italic;">${mensagem.substring(0, 150)}${mensagem.length > 150 ? '...' : ''}</div>
  `;

  try {
    // Envia ambos e-mails em paralelo
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