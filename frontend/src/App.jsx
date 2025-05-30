import { APIProvider } from '@vis.gl/react-google-maps';
import AppRoutes from "./routes/AppRouters";
import AuthProvider from "./contexts/AuthProvider"; // Note a mudança no import

const App = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </APIProvider>
  );
};

export default App;