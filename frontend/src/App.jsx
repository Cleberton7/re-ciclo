import { LoadScript } from "@react-google-maps/api";
import AppRoutes from "./routes/AppRouters.jsx"; // Ou onde estão suas rotas

const App = () => {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
      libraries={['marker']}
    >
      <AppRoutes />
    </LoadScript>


  );
};

export default App;
