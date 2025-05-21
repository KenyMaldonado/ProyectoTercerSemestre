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
            <Route path="editar-equipo/:id" element={<EquipoForm />} />
            <Route path="jugadores/:id" element={<JugadorDetail />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
        </main>
        </div>
    );
};

export default AdminPanel;
