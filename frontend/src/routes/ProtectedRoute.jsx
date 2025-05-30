import { Navigate } from "react-router-dom";
import useAuth from "../contexts/authFunctions";

const ProtectedRoute = ({ element, role, redirectPath = "/" }) => {
  const { isLoggedIn, role: userRole } = useAuth();

  if (!isLoggedIn || (role && userRole !== role)) {
    return <Navigate to={redirectPath} />;
  }

  return element;
};

export default ProtectedRoute;
