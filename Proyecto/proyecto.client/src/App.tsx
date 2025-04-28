import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Inicio from './modules/Inicio';
import Torneos from './modules/torneos/components/Torneos';
import Equipos from './modules/equipos/components/Equipos';
import Jugadores from './modules/jugadores/components/Jugadores';
import Partidos from './modules/partidos/components/Partidos';
import Login from './modules/auth/components/Login';
import AdminPanel from './modules/admin/components/AdminPanel';
import ProtectedRoute from './routes/ProtectedRoute';
import Inscripcion from './modules/inscripcion/components/Inscripcion';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const location = useLocation();
    useEffect(() => {
        const path = location.pathname;
    
        let pageTitle = 'Torneos de Fútbol';
        if (path === '/') pageTitle = 'Inicio';
        else if (path.startsWith('/torneos')) pageTitle = 'Torneos';
        else if (path.startsWith('/equipos')) pageTitle = 'Equipos';
        else if (path.startsWith('/jugadores')) pageTitle = 'Jugadores';
        else if (path.startsWith('/partidos')) pageTitle = 'Partidos';
        else if (path.startsWith('/login')) pageTitle = 'Inicio de Sesión';
        else if (path.startsWith('/inscripcion')) pageTitle = 'Inscripción';
        document.title = pageTitle;
    }, [location]);
    
    return (
        <>
        <Routes>
            <Route element={<MainLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/torneos" element={<Torneos />} />
            <Route path="/inscripcion" element={<Inscripcion />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/jugadores" element={<Jugadores />} />
            <Route path="/partidos" element={<Partidos />} />
            {/* Ruta sin Navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/*" element={
            <ProtectedRoute>
                <AdminPanel />
            </ProtectedRoute>
            } />
            <Route path="*" element={<div>Página no encontrada</div>} />
            </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default App;
