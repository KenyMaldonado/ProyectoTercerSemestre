import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { FaBars, FaTrophy, FaUsers, FaSignOutAlt, FaHome, FaUser } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import gsap from 'gsap';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(true);
  const [hoveringSidebar, setHoveringSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    gsap.to(sidebarRef.current, {
      width: newExpanded ? 220 : 80,
      duration: 0.3,
      ease: 'power2.inOut',
    });
  };

  const handleMouseEnter = () => {
    if (!expanded) {
      setHoveringSidebar(true);
      gsap.to(sidebarRef.current, { width: 220, duration: 0.3 });
    }
  };

  const handleMouseLeave = () => {
    if (!expanded) {
      setHoveringSidebar(false);
      gsap.to(sidebarRef.current, { width: 80, duration: 0.3 });
    }
  };

  const navItems = [
    { to: '/admin/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { to: '/admin/torneos', icon: <FaTrophy />, label: 'Torneos' },
    { to: '/admin/equipos', icon: <FaUsers />, label: 'Equipos' },
    { to: '/admin/jugadores', icon: <FaUser />, label: 'Jugadores' },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`${styles.sidebar} ${!expanded && !hoveringSidebar ? styles.collapsed : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.topSection}>
        <button className={styles.toggleButton} onClick={toggleSidebar} data-tooltip-id="tooltip" data-tooltip-content="Expandir/Ocultar">
          <FaBars />
        </button>
        {(expanded || hoveringSidebar) && <h2 className={styles.title}>👮 Admin</h2>}
      </div>

      <nav>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.sidebarLink} ${isActive ? styles.active : ''}`
                }
                data-tooltip-id="tooltip"
                data-tooltip-content={item.label}
              >
                {item.icon}
                {(expanded || hoveringSidebar) && <span className={styles.linkLabel}>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={handleLogout}
        className={styles.logoutButton}
        data-tooltip-id="tooltip"
        data-tooltip-content="Cerrar sesión"
      >
        <FaSignOutAlt />
        {(expanded || hoveringSidebar) && <span className={styles.linkLabel}>Cerrar sesión</span>}
      </button>

      <Tooltip id="tooltip" place="right" className={styles.tooltip} />
    </aside>
  );
};

export default Sidebar;
