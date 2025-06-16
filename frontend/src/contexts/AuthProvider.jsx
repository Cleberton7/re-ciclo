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
          try {
            const updatedUser = await authService.getUserData();
            const normalizedUser = normalizeUserData(updatedUser || userData);

            localStorage.setItem("userData", JSON.stringify(normalizedUser));

            setAuthState({
              isLoggedIn: true,
              userName: normalizedUser.displayName,
              role: normalizedUser.tipoUsuario,
              userData: normalizedUser,
              emailVerified: normalizedUser.emailVerificado || false,
              loading: false
            });
          } catch (apiError) {
            console.log("Falha ao atualizar dados do usuário, usando dados locais...", apiError);
            const normalizedUser = normalizeUserData(userData);
            setAuthState({
              isLoggedIn: true,
              userName: normalizedUser.displayName,
              role: normalizedUser.tipoUsuario,
              userData: normalizedUser,
              emailVerified: normalizedUser.emailVerificado || false,
              loading: false
            });
          }
        } catch (error) {
          console.log("Token inválido ou expirado, fazendo logout...", error);
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

    const userObj = user?.toObject ? user.toObject() : { ...user };
    const cleanUser = Object.entries(userObj).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    let displayName = '';
    switch (cleanUser.tipoUsuario) {
      case 'empresa':
        displayName = cleanUser.razaoSocial || cleanUser.nome || cleanUser.email;
        break;
      case 'centro':
        displayName = cleanUser.nomeFantasia || cleanUser.nome || cleanUser.email;
        break;
      case 'adminGeral':
        displayName = (cleanUser.nome && cleanUser.nome.trim() !== '')
          ? cleanUser.nome
          : cleanUser.email;
        break;
      default:
        displayName = cleanUser.nome || cleanUser.email;
    }

    return {
      ...cleanUser,
      displayName,
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
