import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Inicio from './pages/Inicio';
import Torneos from './pages/Torneos';
import Equipos from './pages/Equipos';
import Jugadores from './pages/Jugadores';
import Partidos from './pages/Partidos';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './routes/ProtectedRoute';
import { useEffect } from 'react';

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
    
        document.title = pageTitle;
    }, [location]);
    
    return (
        <Routes>
            <Route element={<MainLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/torneos" element={<Torneos />} />
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
    );
}

export default App;
