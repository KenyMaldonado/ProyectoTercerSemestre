import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { gsap } from 'gsap';
import styles from './Navbar.module.css';
import logoUmes from '../../assets/logoUmes.png';

const Navbar = () => {
    const navbarRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        gsap.fromTo(navbarRef.current, 
            { y: -80, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );

        gsap.fromTo(linksRef.current?.children,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
        );
    }, []);

    return (
        <nav className={styles.navbar} ref={navbarRef}>
            <div className={styles.logo}>
                <Link to="/">
                    <img src={logoUmes} alt="Logo" />
                </Link>
            </div>
            <ul className={styles.navLinks} ref={linksRef}>
                <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Inicio</NavLink></li>
                <li><NavLink to="/torneos" className={({ isActive }) => isActive ? styles.active : ''}>Torneos</NavLink></li>
                <li><NavLink to="/equipos" className={({ isActive }) => isActive ? styles.active : ''}>Equipos</NavLink></li>
                <li><NavLink to="/jugadores" className={({ isActive }) => isActive ? styles.active : ''}>Jugadores</NavLink></li>
                <li><NavLink to="/partidos" className={({ isActive }) => isActive ? styles.active : ''}>Partidos</NavLink></li>
                <li><NavLink to="/inscripcion" className={({ isActive }) => isActive ? styles.active : ''}>Inscribirse</NavLink></li>
                <li><NavLink to="/torneos/view-pdf/:fileUrl" className={({ isActive }) => isActive ? styles.active : ''}>Inscribirse</NavLink></li>
                <li><Link to="/login" target="_blank" rel="noopener noreferrer">Login</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
