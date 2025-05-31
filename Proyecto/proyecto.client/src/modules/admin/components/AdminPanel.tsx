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

const AdminPanel = () => {
    return (
        <div className={styles.adminPanel}>
        <Sidebar />
        <main className={styles.mainContent}>
            <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="torneos" element={<TorneosAdmin />} />
            <Route path="equipos" element={<EquiposPage/>} />
            <Route path="jugadores" element={<JugadorList/>} />
            <Route path="equipos/editar-equipo/:id" element={<EquipoForm />} />
            <Route path="jugadores/:id" element={<JugadorDetail />} />
            <Route path="torneos/editar-torneo/:id" element={<TorneoAdminEditar />} />
            <Route path="funciones-extra/noticias" element={<NoticiasAdmin />} />
            <Route path="funciones-extra/usuarios" element={<UsuariosAdmin />} />
            <Route path="inscripciones" element={<InscripcionesAdmin />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
        </main>
        </div>
    );
};

export default AdminPanel;
