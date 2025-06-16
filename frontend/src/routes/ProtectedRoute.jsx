import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const normalizeRole = (role) => {
  if (!role) return '';
  return role.toString().toLowerCase().trim();
};

const ProtectedRoute = ({ 
  element, 
  requiredRoles, // Agora aceita array de roles permitidas
  redirectPath = "/", 
  requireVerifiedEmail = true 
}) => {
  const { isLoggedIn, role, emailVerified, userData } = useAuth();
  
  const userRole = normalizeRole(role || userData?.tipoUsuario);
  const allowedRoles = Array.isArray(requiredRoles) 
    ? requiredRoles.map(normalizeRole)
    : [normalizeRole(requiredRoles)];

  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  if (requiredRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireVerifiedEmail && !emailVerified) {
    return <Navigate to="/email-not-verified" replace />;
  }

  return element;
};

export default ProtectedRoute;