import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import authService from "../services/authService";
import api from "../services/api.js"; 
import { useNavigate } from "react-router-dom";

const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); 
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userName: '',
    role: '',
    userData: null,
    emailVerified: false,
    loading: true,
    error: null
  });

  const normalizeUserData = (user) => {
    if (!user) return {};
    
    const userObj = user?.toObject ? user.toObject() : { ...user };
    
    const cleanUser = {
      id: userObj.id || userObj._id?.toString(),
      email: userObj.email || '',
      tipoUsuario: userObj.tipoUsuario || 'pessoa',
      emailVerificado: userObj.emailVerificado || false,
      nome: userObj.nome || '',
      razaoSocial: userObj.razaoSocial || '',
      nomeFantasia: userObj.nomeFantasia || ''
    };

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
      displayName
    };
  };

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
          
          localStorage.setItem("userData", JSON.stringify({
            ...userData,
            nome: userData.displayName,
            displayName: userData.displayName
          }));
          
          setAuthState({
            isLoggedIn: true,
            userName: userData.displayName,
            role: userData.tipoUsuario,
            userData,
            emailVerified: userData.emailVerificado,
            loading: false,
            error: null
          });

          // Redireciona se e-mail não estiver verificado
          if (!userData.emailVerificado) {
            navigate('/verificar-email');
          }
        }
      } catch (error) {
        console.error("Erro na verificação:", error);
        
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
  }, [navigate]); 

  const login = async (userData, token) => {
    const normalizedUser = normalizeUserData(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify({
      ...normalizedUser,
      displayName: normalizedUser.displayName
    }));

    setAuthState({
      isLoggedIn: true,
      userName: normalizedUser.displayName,
      role: normalizedUser.tipoUsuario,
      userData: normalizedUser,
      emailVerified: normalizedUser.emailVerificado,
      loading: false,
      requiresVerification: !normalizedUser.emailVerificado
    });

    if (!normalizedUser.emailVerificado) {
      navigate('/verificar-email'); // Usando navigate em vez de window.location
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
    navigate('/login'); 
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
