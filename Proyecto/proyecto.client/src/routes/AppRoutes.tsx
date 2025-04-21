import { Routes, Route } from 'react-router-dom';
import Inicio from '../modules/Inicio';
import Torneos from '../modules/torneos/components/Torneos';
import Equipos from '../modules/equipos/components/Equipos';
import Jugadores from '../modules/jugadores/components/Jugadores';
import Partidos from '../modules/partidos/components/Partidos';
import Login from '../modules/auth/components/Login';
import AdminPanel from '../modules/admin/components/AdminPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import TournamentList from '@/features/tournaments/pages/TournamentList';

const AppRoutes = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/torneos" element={<Torneos />} />
                <Route path="/equipos" element={<Equipos />} />
                <Route path="/jugadores" element={<Jugadores />} />
                <Route path="/partidos" element={<Partidos />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
        </>
            
    );
};

export default AppRoutes;
