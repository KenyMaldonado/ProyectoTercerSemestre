// components/Admin/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>
        <h2>Admin</h2>
        <nav>
            <ul>
            <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
            <li><NavLink to="/admin/torneos">Torneos</NavLink></li>
            <li><NavLink to="/admin/equipos">Equipos</NavLink></li>
            <li><NavLink to="/admin/jugadores">Jugadores</NavLink></li>
            </ul>
        </nav>
        </aside>
    );
};

export default Sidebar;