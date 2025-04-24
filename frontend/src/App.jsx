import { LoadScript } from "@react-google-maps/api";
import AppRoutes from "./routes/AppRouters.jsx";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
      libraries={['marker']}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </LoadScript>
  );
};

export default App;
