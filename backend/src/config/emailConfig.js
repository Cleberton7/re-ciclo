import nodemailer from 'nodemailer';
import { EMAIL_FROM, FRONTEND_URL } from './config.js';

// Criação do transporter (versão corrigida)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Apenas para desenvolvimento
  }
});

// Verificação da conexão SMTP (opcional)
transporter.verify((error) => {
  if (error) {
    console.error('❌ Erro na configuração do Nodemailer:', error);
  } else {
    console.log('✅ Servidor de e-mail configurado com sucesso');
  }
});

// Função genérica para enviar e-mails
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject,
      html,
      headers: {
        'X-Mailer': 'Re-ciclo Mailer',
        'X-Priority': '1'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado para ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Erro ao enviar e-mail para ${to}:`, error);
    throw error; // Melhor propagar o erro para quem chamou
  }
};

// Templates de e-mail (mantidos como no seu código)
export const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${FRONTEND_URL}/verificar-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2e7d32;">Verifique seu e-mail</h1>
      <p>Olá ${user.nome || user.razaoSocial || user.nomeFantasia},</p>
      <p>Por favor, clique no link abaixo para verificar seu endereço de e-mail:</p>
      <a href="${verificationUrl}" 
         style="display: inline-block; padding: 10px 20px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 5px;">
         Verificar E-mail
      </a>
      <p style="margin-top: 20px;">Se você não criou uma conta, por favor ignore este e-mail.</p>
      <p style="font-size: 0.8em; color: #666;">Este link expirará em 1 hora.</p>
    </div>
  `;

  return await sendEmail(
    user.email,
    'Verificação de E-mail - Re-ciclo',
    html
  );
};

export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${FRONTEND_URL}/recuperar-senha?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1565c0;">Redefinição de Senha</h1>
      <p>Olá ${user.nome || user.razaoSocial || user.nomeFantasia},</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar:</p>
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 10px 20px; background-color: #1565c0; color: white; text-decoration: none; border-radius: 5px;">
         Redefinir Senha
      </a>
      <p style="margin-top: 20px;">Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
      <p style="font-size: 0.8em; color: #666;">Este link expirará em 1 hora.</p>
    </div>
  `;

  return await sendEmail(
    user.email,
    'Redefinição de Senha - Re-ciclo',
    html
  );
};