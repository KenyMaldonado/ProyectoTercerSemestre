import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { gsap } from 'gsap';
import styles from './Navbar.module.css';
import logoUmes from '../../assets/logoUmes.png';
import logoSistema from '../../assets/logoMesotrans.png';

const Navbar = () => {
    const navbarRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        gsap.fromTo(navbarRef.current, 
            { y: -80, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );

        if (linksRef.current) {
            gsap.fromTo(linksRef.current.children,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
            );
        }
    }, []);

    return (
        <nav className={styles.navbar} ref={navbarRef}>
            <div className={styles.logoContainer}>
                <div className={styles.logo}>
                    <Link to="/">
                        <img src={logoUmes} alt="Logo" />
                    </Link>
                </div>
                <div className={styles.logoSistema}>
                    <Link to="/">
                        <img src={logoSistema} alt="Logo" />
                    </Link>
                </div>
            </div>

            <ul className={styles.navLinks} ref={linksRef}>
                <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Inicio</NavLink></li>
                <li><NavLink to="/torneos" className={({ isActive }) => isActive ? styles.active : ''}>Torneos</NavLink></li>
                <li><NavLink to="/equipos" className={({ isActive }) => isActive ? styles.active : ''}>Equipos</NavLink></li>
                <li><NavLink to="/tabla-posiciones" className={({ isActive }) => isActive ? styles.active : ''}>Tabla de Posiciones</NavLink></li>
                <li><NavLink to="/partidos" className={({ isActive }) => isActive ? styles.active : ''}>Partidos</NavLink></li>
                
                <li><Link to="/login" target="_blank" rel="noopener noreferrer">Login</Link></li>
            </ul>
        </nav>
    );
};
//<li><NavLink to="/inscripcion" className={({ isActive }) => isActive ? styles.active : ''}>Inscribirse</NavLink></li>
export default Navbar;
