import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import authService from "../services/authService";
import api from "../services/api.js"; 

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userName: '',
    role: '',
    userData: null,
    emailVerified: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("userData");

      if (!token) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await api.get('/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const userData = normalizeUserData(response.data.user);
          
          // Armazena os dados de forma consistente
          localStorage.setItem("userData", JSON.stringify({
            ...userData,
            // Garante que o nome não será perdido
            nome: userData.displayName,
            displayName: userData.displayName
          }));
          
          setAuthState({
            isLoggedIn: true,
            userName: userData.displayName, // Usa sempre displayName
            role: userData.tipoUsuario,
            userData,
            emailVerified: userData.emailVerificado,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error("Erro na verificação:", error);
        
        // Limpa os dados inválidos
        if (error.response?.status === 401 || error.response?.status === 500) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
        }

        setAuthState({
          isLoggedIn: false,
          loading: false,
          error: error.response?.data?.code || 'AUTH_ERROR',
          errorDetails: process.env.NODE_ENV === 'development' ? error.message : null
        });
      }
    };

    verifyAuth();
  }, []);

  const normalizeUserData = (user) => {
    if (!user) return {};
    
    const userObj = user?.toObject ? user.toObject() : { ...user };
    
    // Garante campos mínimos
    const cleanUser = {
      id: userObj.id || userObj._id?.toString(),
      email: userObj.email || '',
      tipoUsuario: userObj.tipoUsuario || 'pessoa',
      emailVerificado: userObj.emailVerificado || false,
      // Campos de nome específicos
      nome: userObj.nome || '',
      razaoSocial: userObj.razaoSocial || '',
      nomeFantasia: userObj.nomeFantasia || ''
    };

    // Lógica robusta para displayName
    let displayName = userObj.displayName || '';
    
    if (!displayName) {
      switch (cleanUser.tipoUsuario) {
        case 'empresa':
          displayName = cleanUser.razaoSocial || cleanUser.nomeFantasia || cleanUser.nome || cleanUser.email;
          break;
        case 'centro':
          displayName = cleanUser.nomeFantasia || cleanUser.nome || cleanUser.email;
          break;
        default:
          displayName = cleanUser.nome || cleanUser.email || 'Usuário';
      }
    }

    return {
      ...cleanUser,
      displayName // Garante que sempre terá um valor válido
    };
  };

  const login = async (userData, token) => {
    const normalizedUser = normalizeUserData(userData);

    // Armazena todos os dados necessários
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify({
      ...normalizedUser,
      displayName: normalizedUser.displayName
    }));

    setAuthState({
      isLoggedIn: true,
      userName: normalizedUser.displayName, // Sempre usa displayName
      role: normalizedUser.tipoUsuario,
      userData: normalizedUser,
      emailVerified: normalizedUser.emailVerificado,
      loading: false,
      requiresVerification: !normalizedUser.emailVerificado
    });
      // Se precisar de verificação, redireciona para a página de verificação
    if (!normalizedUser.emailVerificado) {
      // Você pode usar seu sistema de roteamento aqui
      window.location.href = '/verificar-email';
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setAuthState({
      isLoggedIn: false,
      userName: '',
      role: '',
      userData: null,
      emailVerified: false,
      loading: false
    });
  };

  const verifyEmail = async () => {
    try {
      const updatedUser = await authService.getUserData();
      const normalizedUser = normalizeUserData(updatedUser);

      localStorage.setItem("userData", JSON.stringify(normalizedUser));

      setAuthState(prev => ({
        ...prev,
        userData: normalizedUser,
        emailVerified: true
      }));

      return true;
    } catch (error) {
      console.error("Erro ao verificar e-mail:", error);
      return false;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await authService.resendVerificationEmail();
      return true;
    } catch (error) {
      console.error("Erro ao reenviar e-mail de verificação:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      verifyEmail,
      resendVerificationEmail,

      updateUserData: (newData) => {
        const updatedUser = normalizeUserData({
          ...authState.userData,
          ...newData
        });

        localStorage.setItem("userData", JSON.stringify(updatedUser));

        setAuthState(prev => ({
          ...prev,
          userData: updatedUser,
          userName: updatedUser.displayName,
          role: updatedUser.tipoUsuario,
          emailVerified: updatedUser.emailVerificado || false
        }));
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
