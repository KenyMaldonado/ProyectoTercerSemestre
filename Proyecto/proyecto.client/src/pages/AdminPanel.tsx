// pages/AdminPanel.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Admin/Sidebar';
import Dashboard from '../components/Admin/Dashboard';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
    return (
        <div className={styles.adminPanel}>
        <Sidebar />
        <main className={styles.mainContent}>
            <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="torneos" element={<h2>Gestión de Torneos</h2>} />
            <Route path="equipos" element={<h2>Gestión de Equipos</h2>} />
            <Route path="jugadores" element={<h2>Gestión de Jugadores</h2>} />
            <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
        </main>
        </div>
    );
};

export default AdminPanel;
