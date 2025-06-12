import { Routes, Route } from 'react-router-dom';
import Inicio from '../modules/Inicio';
import Torneos from '../modules/torneos/components/Torneos';
import Equipos from '../modules/equipos/components/Equipos';
import Jugadores from '../modules/jugadores/components/Jugadores';
import Partidos from '../modules/partidos/components/Partidos';
import InscripcionTorneo from '../modules/inscripcion/components/Inscripcion';
import Login from '../modules/auth/components/Login';
import ForgotPassword from '../modules/auth/components/ForgotPassword';
import ActivarCuenta from '../modules/auth/components/ActivarCuenta';
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
        <Route path="/tabla-posiciones" element={<Jugadores />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/inscripcion" element={<InscripcionTorneo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/activar-cuenta/:token" element={<ActivarCuenta />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AppRoutes;

