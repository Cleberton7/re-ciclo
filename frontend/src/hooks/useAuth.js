// hooks/useAuth.js
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return {
    isLoggedIn: context.isLoggedIn,
    role: context.role,
    emailVerified: context.emailVerified,
    userName: context.userName,
    userData: context.userData,
    loading: context.loading,
    error: context.error,
    login: context.login,
    logout: context.logout,
    verifyEmail: context.verifyEmail,
    resendVerificationEmail: context.resendVerificationEmail,
    updateUserData: context.updateUserData
  };
};

export default useAuth;