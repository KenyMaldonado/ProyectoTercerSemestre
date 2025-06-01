import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Inicio from './modules/Inicio';
import Torneos from './modules/torneos/components/Torneos';
import Equipos from './modules/equipos/components/Equipos';
import Jugadores from './modules/jugadores/components/Jugadores';
import Partidos from './modules/partidos/components/Partidos';
import Login from './modules/auth/components/Login';
import ForgotPassword from './modules/auth/components/ForgotPassword';
import ResetPassword from './modules/auth/components/ResetPassword';
import AdminPanel from './modules/admin/components/AdminPanel';
import ProtectedRoute from './routes/ProtectedRoute';
import Inscripcion from './modules/inscripcion/components/Inscripcion';
import ActivarCuenta from './modules/auth/components/ActivarCuenta';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';


// Importar el visor de PDF
import PdfViewer from "./modules/torneos/components/PdfViewer";

function App() {
  const location = useLocation();

  useEffect(() => {
    // Inicializar AOS
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    // Cambiar título dinámicamente
    const path = location.pathname;

    let pageTitle = 'Torneos de Fútbol';
    if (path === '/') pageTitle = 'Inicio';
    else if (path.startsWith('/torneos')) pageTitle = 'Torneos';
    else if (path.startsWith('/equipos')) pageTitle = 'Equipos';
    else if (path.startsWith('/jugadores')) pageTitle = 'Jugadores';
    else if (path.startsWith('/partidos')) pageTitle = 'Partidos';
    else if (path.startsWith('/login')) pageTitle = 'Inicio de Sesión';
    else if (path.startsWith('/inscripcion')) pageTitle = 'Inscripción';
    else if (path.startsWith('/forgotpassword')) pageTitle = 'Recuperar contraseña';

    document.title = pageTitle;
  }, [location]);

  return (
    <>
      <Routes>
        {/* Rutas adicionales para el visor de PDF */}
        
        {/* Rutas sin layout (sin navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas con layout */}
        <Route element={<MainLayout />}>
          <Route path="/torneos/view-pdf/:fileUrl" element={<PdfViewer />} />
          <Route path="/" element={<Inicio />} />
          <Route path="/torneos" element={<Torneos />} />
          <Route path="/inscripcion" element={<Inscripcion />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/partidos" element={<Partidos />} />
          <Route path="/activar-cuenta" element={<ActivarCuenta />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
