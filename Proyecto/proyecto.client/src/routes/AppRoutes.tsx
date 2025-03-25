import { Routes, Route } from 'react-router-dom';
import Inicio from '../pages/Inicio';
import Torneos from '../pages/Torneos';
import Equipos from '../pages/Equipos';
import Jugadores from '../pages/Jugadores';
import Partidos from '../pages/Partidos';
import Login from '../pages/Login';
import AdminPanel from '../pages/AdminPanel';
// import TournamentList from '@/features/tournaments/pages/TournamentList';

const AppRoutes = () => {
    return (
            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/torneos" element={<Torneos />} />
                <Route path="/equipos" element={<Equipos />} />
                <Route path="/jugadores" element={<Jugadores />} />
                <Route path="/partidos" element={<Partidos />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
    );
};

export default AppRoutes;
