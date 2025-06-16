import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import  authService  from "../services/authService"; // ✅ Ajustado aqui

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userName: '',
    role: '',
    userData: null,
    emailVerified: false,
    loading: true
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("userData");

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          let normalizedUser = normalizeUserData(userData);
          
          try {
            const updatedUser = await authService.getUserData();
            normalizedUser = normalizeUserData({
              ...normalizedUser, // Mantém os dados existentes
              ...updatedUser     // Atualiza com novos dados
            });
          } catch (apiError) {
            console.log("Usando dados locais...", apiError);
          }

          // Garante que o displayName não seja perdido
          if (!normalizedUser.displayName) {
            normalizedUser.displayName = userData.displayName || 
                                        normalizedUser.nome || 
                                        normalizedUser.email || 
                                        'Usuário';
          }

          localStorage.setItem("userData", JSON.stringify(normalizedUser));

          setAuthState({
            isLoggedIn: true,
            userName: normalizedUser.displayName,
            role: normalizedUser.tipoUsuario,
            userData: normalizedUser,
            emailVerified: normalizedUser.emailVerificado || false,
            loading: false
          });
        } catch (error) {
          console.log("Erro na verificação...", error);
          logout();
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };
    verifyAuth();
  }, []);

  const normalizeUserData = (user) => {
    if (!user) return {};
    
    // Garante que trabalhamos com um objeto simples
    const userObj = user?.toObject ? user.toObject() : { ...user };
    
    // Remove campos nulos/undefined
    const cleanUser = Object.entries(userObj).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Lógica aprimorada para displayName
    let displayName = '';
    
    // 1. Primeiro tenta usar o nome armazenado
    if (cleanUser.displayName) {
      displayName = cleanUser.displayName;
    } 
    // 2. Se não tiver, usa a lógica específica por tipo de usuário
    else {
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
      displayName, // Garante que sempre terá um valor
      tipoUsuario: cleanUser.tipoUsuario || 'pessoa',
      id: cleanUser.id || cleanUser._id?.toString(),
      emailVerificado: cleanUser.emailVerificado || false
    };
  };

  const login = async (userData, token) => {
    const normalizedUser = normalizeUserData(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(normalizedUser));

    setAuthState({
      isLoggedIn: true,
      userName: normalizedUser.displayName,
      role: normalizedUser.tipoUsuario,
      userData: normalizedUser,
      emailVerified: normalizedUser.emailVerificado || false,
      loading: false
    });
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
