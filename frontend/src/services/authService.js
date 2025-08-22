import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  withCredentials: true,
});

// Intercepta e adiciona o token automaticamente
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export const loginUser = async ({ email, cnpj, senha }) => {
  try {
    const identificador = email || cnpj; // envia email ou CNPJ
    const response = await api.post('/auth/login', { identificador, senha });

    if (!response.data.token || !response.data.usuario) {
      throw new Error('Resposta de login inválida');
    }

    return {
      token: response.data.token,
      usuario: response.data.usuario
    };
  } catch (error) {
    // Tratamento específico para erro 403 (e-mail não verificado)
    if (error.response?.status === 403 && error.response.data?.code === 'EMAIL_NOT_VERIFIED') {
      error.code = 'EMAIL_NOT_VERIFIED';
      error.email = email;
    }
    throw error;
  }
};


export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};
// Cadastro feito pelo admin
export const adminRegisterUser = async (userData) => {
  const response = await api.post('/auth/admin-register', userData);
  return response.data;
};


export const getUserData = async () => {
  const response = await api.get('/usuarios/pessoal');
  return response.data;
};
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/request-password-reset', { email });
  return response.data;
};

export const resetPassword = async (token, novaSenha) => {
  const response = await api.post('/auth/reset-password', { token, novaSenha });
  return response.data;
};

export const forgotPassword = async (email) => {
  return axios.post('/api/auth/forgot-password', { email });
};


export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
};

export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const authService = {
  loginUser,
  registerUser,
  adminRegisterUser, 
  getUserData,
  requestPasswordReset,
  resetPassword,
  forgotPassword,
  verifyEmail,
  resendVerificationEmail
};

export default authService;
