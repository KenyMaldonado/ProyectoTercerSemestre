// pages/AdminPanel.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import styles from './AdminPanel.module.css';
import TorneosAdmin from '../modules/torneos/components/TorneoAdmin';
import EquiposPage from '../modules/equipos/components/EquiposAdmin';
import Equipos from '../../equipos/components/Equipos';

const AdminPanel = () => {
    return (
        <div className={styles.adminPanel}>
        <Sidebar />
        <main className={styles.mainContent}>
            <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="torneos" element={<TorneosAdmin />} />
            <Route path="equipos" element={<EquiposPage/>} />
            <Route path="jugadores" element={<h2>Gestión de Jugadores</h2>} />
            <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
        </main>
        </div>
    );
};

export default AdminPanel;
