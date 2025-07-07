import { APIProvider } from '@vis.gl/react-google-maps';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from "./routes/AppRouters";
import AuthProvider from "./contexts/AuthProvider";

const App = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </APIProvider>
  );
};

export default App;