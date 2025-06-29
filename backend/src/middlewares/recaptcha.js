import axios from 'axios';

export const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;
    console.log('Token reCAPTCHA recebido no backend:', recaptchaToken);
  
  if (!recaptchaToken) {
    return res.status(400).json({ 
      success: false,
      message: 'Token reCAPTCHA ausente' 
    });
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken
        }
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Falha na verificação reCAPTCHA' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação reCAPTCHA:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao verificar reCAPTCHA' 
    });
  }
};
