// pages/AdminPanel.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import styles from './AdminPanel.module.css';
import EquipoForm from '../modules/equipos/components/EquipoForms';
import TorneosAdmin from '../modules/torneos/components/TorneoAdmin';
import EquiposPage from '../modules/equipos/components/EquiposAdmin';
import JugadorDetail from '../modules/jugadores/components/JugadorDetail';
import JugadorList from '../modules/jugadores/components/JugadorList';
import TorneoAdminEditar from '../modules/torneos/components/TorneoAdminEditar';
import NoticiasAdmin from '../modules/funciones/gestionNoticias/components/noticiasAdmin';
import UsuariosAdmin from '../modules/funciones/gestionUsuarios/components/usuariosAdmin';
import InscripcionesAdmin from '../modules/inscripciones/components/InscripcionesAdmin';
import DetalleInscripcion from '../modules/inscripciones/components/detalleInscripcion';
import TournamentSelector from '../modules/torneos/components/TournamentSelector';
import TournamentTeams from '../modules/torneos/components/StartTournaments';
import CanchasAdmin from '../modules/funciones/gestionCancha/components/CanchasAdmin';
import PartidosAdmin from '../modules/partidos/components/partidosAdmin';

const AdminPanel = () => {
    return (
        <div className={styles.adminPanel}>
        <Sidebar />
        <main className={styles.mainContent}>
            <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="partidos" element={<PartidosAdmin />} />
            <Route path="torneos/gestionar" element={<TorneosAdmin />} />
            <Route path="torneos/iniciar" element={<TournamentSelector />} />
            <Route path="torneos/iniciar/detalles/:subTorneoId" element={<TournamentTeams />} />
            <Route path="equipos" element={<EquiposPage/>} />
            <Route path="jugadores" element={<JugadorList/>} />
            <Route path="equipos/editar-equipo/:id" element={<EquipoForm />} />
            <Route path="jugadores/:id" element={<JugadorDetail />} />
            <Route path="torneos/editar-torneo/:id" element={<TorneoAdminEditar />} />
            <Route path="funciones-extra/canchas" element={<CanchasAdmin />} />
            <Route path="funciones-extra/noticias" element={<NoticiasAdmin />} />
            <Route path="funciones-extra/usuarios" element={<UsuariosAdmin />} />
            <Route path="inscripciones" element={<InscripcionesAdmin />} />
            <Route path="inscripciones/:id" element={<DetalleInscripcion />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
        </main>
        </div>
    );
};

export default AdminPanel;
