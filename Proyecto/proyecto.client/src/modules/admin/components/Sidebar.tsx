import { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  FaBars, FaTrophy, FaUsers, FaSignOutAlt,
  FaHome, FaUser, FaAngleDown, FaAngleRight, FaToolbox,
  FaUserCog, FaNewspaper, FaClipboardList, FaPlay,
  FaRegFutbol,
} from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import gsap from 'gsap';
import styles from './Sidebar.module.css';
import { FaCalendarCheck} from 'react-icons/fa6';

const Sidebar = () => {
  const { logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(true);
  const [hoveringSidebar, setHoveringSidebar] = useState(false);

  const [showExtraFunctions, setShowExtraFunctions] = useState({
    funcionesExtra: false,
    torneos: false,
  });

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
    { to: '/admin/partidos', icon: <FaCalendarCheck/>, label: 'Partidos'},
    { to: '/admin/inscripciones', icon: <FaClipboardList />, label: 'Inscripciones' },
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

          {/* Menú Torneos con subitems */}
          <li>
            <button
              className={`${styles.sidebarLink} ${styles.expandable}`}
              onClick={() => setShowExtraFunctions(prev => ({ ...prev, torneos: !prev.torneos }))}
              data-tooltip-id="tooltip"
              data-tooltip-content="Torneos"
            >
              <FaTrophy />
              {(expanded || hoveringSidebar) && (
                <>
                  <span className={styles.linkLabel}>Torneos</span>
                  <span className={styles.arrowIcon}>
                    {showExtraFunctions.torneos ? <FaAngleDown /> : <FaAngleRight />}
                  </span>
                </>
              )}
            </button>

            {(showExtraFunctions.torneos && (expanded || hoveringSidebar)) && (
              <ul className={styles.submenu}>
                <li>
                  <NavLink
                    to="/admin/torneos/gestionar"
                    className={({ isActive }) =>
                      `${styles.sidebarLink} ${styles.subItem} ${isActive ? styles.active : ''}`
                    }
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Gestionar Torneos"
                  >
                    <FaToolbox />
                    <span className={styles.linkLabel}>Gestionar</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/torneos/iniciar"
                    className={({ isActive }) =>
                      `${styles.sidebarLink} ${styles.subItem} ${isActive ? styles.active : ''}`
                    }
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Iniciar Torneo"
                  >
                    <FaPlay />
                    <span className={styles.linkLabel}>Iniciar</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Funciones Extra */}
          <li>
            <button
              className={`${styles.sidebarLink} ${styles.expandable}`}
              onClick={() => setShowExtraFunctions(prev => ({ ...prev, funcionesExtra: !prev.funcionesExtra }))}
              data-tooltip-id="tooltip"
              data-tooltip-content="Funciones extra"
            >
              <FaToolbox />
              {(expanded || hoveringSidebar) && (
                <>
                  <span className={styles.linkLabel}>Funciones extra</span>
                  <span className={styles.arrowIcon}>
                    {showExtraFunctions.funcionesExtra ? <FaAngleDown /> : <FaAngleRight />}
                  </span>
                </>
              )}
            </button>

            {(showExtraFunctions.funcionesExtra && (expanded || hoveringSidebar)) && (
              <ul className={styles.submenu}>
                <li>
                  <NavLink
                    to="/admin/funciones-extra/canchas"
                    className={({ isActive }) =>
                      `${styles.sidebarLink} ${styles.subItem} ${isActive ? styles.active : ''}`
                    }
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Gestionar Canchas"
                  >
                    <FaRegFutbol />
                    <span className={styles.linkLabel}>Gestionar Canchas</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/funciones-extra/usuarios"
                    className={({ isActive }) =>
                      `${styles.sidebarLink} ${styles.subItem} ${isActive ? styles.active : ''}`
                    }
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Gestionar Usuarios"
                  >
                    <FaUserCog />
                    <span className={styles.linkLabel}>Gestionar Usuarios</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/funciones-extra/noticias"
                    className={({ isActive }) =>
                      `${styles.sidebarLink} ${styles.subItem} ${isActive ? styles.active : ''}`
                    }
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Gestionar Noticias"
                  >
                    <FaNewspaper />
                    <span className={styles.linkLabel}>Gestionar Noticias</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
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
