import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import authService from "../services/authService";

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userName: '',
    role: '',
    userData: null
  });

  // Verifica autenticação ao carregar
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("userData");

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setAuthState({
            isLoggedIn: true,
            userName: userData.displayName,
            role: userData.tipoUsuario,
            userData: userData
          });
          
          // Verifica se o token ainda é válido
          await authService.getUserData();
          return;
        } catch (error) {
          console.log("Token inválido ou expirado, fazendo logout...",error);
          logout();
        }
      }

      if (!token) return;

      try {
        const user = await authService.getUserData();
        const userData = normalizeUserData(user);

        localStorage.setItem("userData", JSON.stringify(userData));

        setAuthState({
          isLoggedIn: true,
          userName: userData.displayName,
          role: userData.tipoUsuario,
          userData: userData
        });
      } catch (error) {
        console.error("Falha ao verificar autenticação:", error);
        logout();
      }
    };

    verifyAuth();
  }, []);

  const normalizeUserData = (user) => {
    if (!user) return {};

    // Cria cópia segura do objeto
    const userObj = user?.toObject ? user.toObject() : { ...user };
    
    // Remove campos vazios ou undefined
  const cleanUser = Object.entries(userObj).reduce((acc, [key, value]) => {
    // Remove campos vazios, null ou undefined, mas mantém string vazia ('')
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

    // Lógica robusta para displayName
    let displayName = '';
    switch(cleanUser.tipoUsuario) {
      case 'empresa':
        displayName = cleanUser.razaoSocial || cleanUser.nome || cleanUser.email;
        break;
      case 'coletor':
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
      id: cleanUser.id || cleanUser._id?.toString()
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
      userData: normalizedUser
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setAuthState({
      isLoggedIn: false,
      userName: '',
      role: '',
      userData: null
    });
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      login,
      logout,
      // Adiciona função para atualizar dados do usuário
      updateUserData: (newData) => {
        const updatedUser = normalizeUserData({
          ...authState.userData,
          ...newData
        });
        
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        
        setAuthState(prev => ({
          ...prev,
          userData: updatedUser,
          userName: updatedUser.displayName
        }));
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;