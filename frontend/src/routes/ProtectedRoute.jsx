// routes/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";

const normalizeRole = (role) => {
  const rolesMap = {
    'admin': 'adminGeral',
    'adminGeral': 'adminGeral',
    'centro': 'centro',
    'empresa': 'empresa',
    'pessoa': 'pessoa'
  };
  return rolesMap[role?.toString().toLowerCase().trim()] || '';
};

const ProtectedRoute = ({ 
  element, 
  requiredRoles,
  redirectPath = "/login",
  requireVerifiedEmail = true
}) => {
  const { 
    isLoggedIn, 
    loading, 
    userData, 
    emailVerified,
    error 
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return <Navigate 
      to={redirectPath} 
      state={{ error: error || 'AUTH_REQUIRED' }} 
      replace 
    />;
  }

  if (requireVerifiedEmail && !emailVerified) {
    return <Navigate to="/email-not-verified" replace />;
  }

  if (requiredRoles) {
    const userRole = normalizeRole(userData?.tipoUsuario);
    const allowedRoles = Array.isArray(requiredRoles)
      ? requiredRoles.map(normalizeRole)
      : [normalizeRole(requiredRoles)];

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;