import { Link, NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
        <div className={styles.logo}>
            <Link to="/"><img src="https://static.wixstatic.com/media/1724d0_e70c7a6cd252418fa6049727caf7e61b~mv2.png/v1/crop/x_23,y_643,w_3254,h_1264/fill/w_142,h_55,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Variaciones%20de%20Logotipo-08.png" alt="" /></Link>
        </div>
        <ul className={styles.navLinks}>
            <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Inicio</NavLink></li>
            <li><NavLink to="/torneos" className={({ isActive }) => isActive ? styles.active : ''}>Torneos</NavLink></li>
            <li><NavLink to="/equipos" className={({ isActive }) => isActive ? styles.active : ''}>Equipos</NavLink></li>
            <li><NavLink to="/jugadores" className={({ isActive }) => isActive ? styles.active : ''}>Jugadores</NavLink></li>
            <li><NavLink to="/partidos" className={({ isActive }) => isActive ? styles.active : ''}>Partidos</NavLink></li>
            <li><Link to="/login" target="_blank" rel="noopener noreferrer">Login</Link></li>
        </ul>
        </nav>
    );
};

export default Navbar;
