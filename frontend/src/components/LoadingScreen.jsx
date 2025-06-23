
import { ClipLoader } from "react-spinners";
import "../pages/styles/loadingScreen.css";

const LoadingScreen = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <ClipLoader size={50} color="#009951" />
      <p>Verificando autenticação...</p>
    </div>
  );
};

export default LoadingScreen;