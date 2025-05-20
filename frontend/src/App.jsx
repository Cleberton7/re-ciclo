import { APIProvider } from '@vis.gl/react-google-maps';
import AppRoutes from "./routes/AppRouters";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <APIProvider 
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
      onLoad={() => console.log('API do Google Maps carregada com sucesso')}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </APIProvider>
  );
};

export default App;