import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Inicio from './pages/Inicio';
import Torneos from './pages/Torneos';
import Equipos from './pages/Equipos';
import Jugadores from './pages/Jugadores';
import Partidos from './pages/Partidos';
import { useEffect } from 'react';
import Login from './pages/Login';

const App = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;

        let pageTitle = 'Torneos de Fútbol';
        if (path === '/') pageTitle = 'Inicio - Torneos de Fútbol';
        else if (path.startsWith('/torneos')) pageTitle = 'Torneos';
        else if (path.startsWith('/equipos')) pageTitle = 'Equipos';
        else if (path.startsWith('/jugadores')) pageTitle = 'Jugadores';
        else if (path.startsWith('/partidos')) pageTitle = 'Partidos';
        else if (path.startsWith('/login')) pageTitle = 'Inicio de Sesión';

        document.title = pageTitle;
    }, [location]);

    return (
        <>
        <Navbar />
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/torneos" element={<Torneos />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/jugadores" element={<Jugadores />} />
            <Route path="/partidos" element={<Partidos />} />
            <Route path="/login" element={<Login />} />
        </Routes>
        </>
    );
};

export default App;
