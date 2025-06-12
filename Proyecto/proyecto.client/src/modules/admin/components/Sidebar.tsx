import { useState, useRef, useEffect } from 'react';
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
import { FaCalendarCheck } from 'react-icons/fa6';

const Sidebar = () => {
  const { logout, rol } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(true);
  const [hoveringSidebar, setHoveringSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [showExtraFunctions, setShowExtraFunctions] = useState({
    funcionesExtra: false,
    torneos: false,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      gsap.to(document.body, {
        paddingLeft: '0px',
        duration: 0.3,
        ease: 'power2.inOut',
      });
      return;
    }

    const targetPadding = expanded ? 220 : 80;

    gsap.to(document.body, {
      paddingLeft: `${targetPadding}px`,
      duration: 0.3,
      ease: 'power2.inOut',
    });

    return () => {
      gsap.to(document.body, {
        paddingLeft: '0px',
        duration: 0.3,
        ease: 'power2.inOut',
      });
    };
  }, [expanded, isMobile]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);

    if (isMobile) {
      // En móviles usar clases CSS, no GSAP
      return;
    }

    gsap.to(sidebarRef.current, {
      width: newExpanded ? 220 : 80,
      duration: 0.3,
      ease: 'power2.inOut',
    });
  };

  const handleMouseEnter = () => {
    if (!expanded && !isMobile) {
      setHoveringSidebar(true);
      gsap.to(sidebarRef.current, { width: 220, duration: 0.3 });
    }
  };

  const handleMouseLeave = () => {
    if (!expanded && !isMobile) {
      setHoveringSidebar(false);
      gsap.to(sidebarRef.current, { width: 80, duration: 0.3 });
    }
  };

  // Definir ítems de navegación con roles permitidos
  const navItems = [
    { to: '/admin/dashboard', icon: <FaHome />, label: 'Dashboard', roles: ['Admin'] },
    { to: '/admin/partidos', icon: <FaCalendarCheck />, label: 'Partidos', roles: ['Admin', 'Arbitro'] },
    { to: '/admin/inscripciones', icon: <FaClipboardList />, label: 'Inscripciones', roles: ['Admin'] },
    { to: '/admin/equipos', icon: <FaUsers />, label: 'Equipos', roles: ['Admin'] },
    { to: '/admin/jugadores', icon: <FaUser />, label: 'Jugadores', roles: ['Admin'] },
  ];

  return (
    <>
      {isMobile && (
        <button
          className={styles.floatingToggle}
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${!expanded && !hoveringSidebar && !isMobile ? styles.collapsed : ''} ${isMobile && expanded ? styles.expanded : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.topSection}>
          {!isMobile && (
            <button
              className={styles.toggleButton}
              onClick={toggleSidebar}
              data-tooltip-id="tooltip"
              data-tooltip-content="Expandir/Ocultar"
            >
              <FaBars />
            </button>
          )}
          {(expanded || hoveringSidebar || isMobile) && (
            <h2 className={styles.title}>
              {rol === 'Admin' ? '👮 Admin' : rol === 'Arbitro' ? '⚽ Árbitro' : '👤 Usuario'}
            </h2>
          )}
        </div>

        <div className={styles.sidebarContent}>
          <nav>
            <ul className={styles.navList}>
              {navItems
                .filter(item => item.roles.includes(rol || ''))
                .map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `${styles.sidebarLink} ${isActive ? styles.active : ''}`
                      }
                      data-tooltip-id="tooltip"
                      data-tooltip-content={item.label}
                      onClick={() => isMobile && setExpanded(false)}
                    >
                      {item.icon}
                      {(expanded || hoveringSidebar || isMobile) && (
                        <span className={styles.linkLabel}>{item.label}</span>
                      )}
                    </NavLink>
                  </li>
                ))}

              {/* Menú Torneos solo para Admin */}
              {rol === 'Admin' && (
                <li>
                  <button
                    className={`${styles.sidebarLink} ${styles.expandable}`}
                    onClick={() => setShowExtraFunctions(prev => ({ ...prev, torneos: !prev.torneos }))}
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Torneos"
                  >
                    <FaTrophy />
                    {(expanded || hoveringSidebar || isMobile) && (
                      <>
                        <span className={styles.linkLabel}>Torneos</span>
                        <span className={styles.arrowIcon}>
                          {showExtraFunctions.torneos ? <FaAngleDown /> : <FaAngleRight />}
                        </span>
                      </>
                    )}
                  </button>

                  {(showExtraFunctions.torneos && (expanded || hoveringSidebar || isMobile)) && (
                    <ul className={styles.submenu}>
                      <li>
                        <NavLink
                          to="/admin/torneos/gestionar"
                          className={({ isActive }) =>
                            `${styles.sidebarLink} ${styles.subItem} ${isActive ? styles.active : ''}`
                          }
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Gestionar Torneos"
                          onClick={() => isMobile && setExpanded(false)}
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
                          onClick={() => isMobile && setExpanded(false)}
                        >
                          <FaPlay />
                          <span className={styles.linkLabel}>Iniciar</span>
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              {/* Funciones Extra solo para Admin */}
              {rol === 'Admin' && (
                <li>
                  <button
                    className={`${styles.sidebarLink} ${styles.expandable}`}
                    onClick={() => setShowExtraFunctions(prev => ({ ...prev, funcionesExtra: !prev.funcionesExtra }))}
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Funciones extra"
                  >
                    <FaToolbox />
                    {(expanded || hoveringSidebar || isMobile) && (
                      <>
                        <span className={styles.linkLabel}>Funciones extra</span>
                        <span className={styles.arrowIcon}>
                          {showExtraFunctions.funcionesExtra ? <FaAngleDown /> : <FaAngleRight />}
                        </span>
                      </>
                    )}
                  </button>

                  {(showExtraFunctions.funcionesExtra && (expanded || hoveringSidebar || isMobile)) && (
                    <ul className={styles.submenu}>
                      <li>
                        <NavLink
                          to="/admin/funciones-extra/canchas"
                          className={({ isActive }) =>
                            `${styles.sidebarLink} ${styles.subItem} ${isActive ? styles.active : ''}`
                          }
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Gestionar Canchas"
                          onClick={() => isMobile && setExpanded(false)}
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
                          onClick={() => isMobile && setExpanded(false)}
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
                          onClick={() => isMobile && setExpanded(false)}
                        >
                          <FaNewspaper />
                          <span className={styles.linkLabel}>Gestionar Noticias</span>
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className={styles.bottomSection}>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
            data-tooltip-id="tooltip"
            data-tooltip-content="Cerrar sesión"
          >
            <FaSignOutAlt />
            {(expanded || hoveringSidebar || isMobile) && (
              <span className={styles.linkLabel}>Cerrar sesión</span>
            )}
          </button>
        </div>

        <Tooltip id="tooltip" place="right" />
      </aside>
    </>
  );
};

export default Sidebar;
