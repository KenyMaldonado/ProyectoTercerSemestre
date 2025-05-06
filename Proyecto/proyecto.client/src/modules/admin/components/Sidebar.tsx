import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../auth/context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth(); 

    const handleLogout = () => {
        logout(); 
        localStorage.removeItem('authToken'); 
        window.location.href = "/login"; 
    };

    return (
        <aside className={styles.sidebar}>
        <h2>👮 Admin</h2>
        <nav>
            <ul>
            <li><NavLink to="/admin/dashboard" className={styles.sidebarLink}>Dashboard</NavLink></li>
            <li><NavLink to="/admin/torneos" className={styles.sidebarLink}>Torneos</NavLink></li>
            <li><NavLink to="/admin/equipos" className={styles.sidebarLink}>Equipos</NavLink></li>
            <li><NavLink to="/admin/jugadores" className={styles.sidebarLink}>Jugadores</NavLink></li>
            </ul>
        </nav>
        <button onClick={handleLogout} className={styles.logoutButton}>Cerrar sesión</button>
        </aside>
    );
};

export default Sidebar;