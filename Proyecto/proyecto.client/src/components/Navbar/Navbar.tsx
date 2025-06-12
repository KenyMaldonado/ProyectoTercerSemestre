import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { gsap } from 'gsap';
import styles from './Navbar.module.css';
import logoUmes from '../../assets/logoUmes.png';
import logoSistema from '../../assets/logoMesotrans.png';
import { Menu, X } from 'lucide-react'; // Asegúrate de tener instalada `lucide-react`

const Navbar = () => {
  const navbarRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navbarRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    );

    if (linksRef.current) {
      gsap.fromTo(
        linksRef.current.children,
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
            <img src={logoUmes} alt="Logo Umes" />
          </Link>
        </div>
        <div className={styles.logoSistema}>
          <Link to="/">
            <img src={logoSistema} alt="Logo Sistema" />
          </Link>
        </div>
      </div>

      <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <ul
        ref={linksRef}
        className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}
        onClick={() => setMenuOpen(false)} // Cierra el menú al hacer clic en un enlace
      >
        <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Inicio</NavLink></li>
        <li><NavLink to="/torneos" className={({ isActive }) => isActive ? styles.active : ''}>Torneos</NavLink></li>
        <li><NavLink to="/calendarios" className={({ isActive }) => isActive ? styles.active : ''}>Calendario</NavLink></li>
        <li><NavLink to="/tabla-posiciones" className={({ isActive }) => isActive ? styles.active : ''}>Tabla de Posiciones</NavLink></li>
        <li><NavLink to="/partidos" className={({ isActive }) => isActive ? styles.active : ''}>Partidos</NavLink></li>
        <li><Link to="/login" target="_blank" rel="noopener noreferrer">Login</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
