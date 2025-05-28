import { Routes, Route } from 'react-router-dom';
import Inicio from '../modules/Inicio';
import Torneos from '../modules/torneos/components/Torneos';
import Equipos from '../modules/equipos/components/Equipos';
import Jugadores from '../modules/jugadores/components/Jugadores';
import Partidos from '../modules/partidos/components/Partidos';
import Login from '../modules/auth/components/Login';
import ForgotPassword from '../modules/auth/components/ForgotPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/torneos" element={<Torneos />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/jugadores" element={<Jugadores />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AppRoutes;

