import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegIdCard, FaFilter, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import { obtenerInscripciones, Inscripcion as InscripcionBase } from '../../../services/api';


type EstadoInscripcion = 'EnRevision' | 'EnCorreccion' | 'Aprobada' | 'Rechazada' | 'Cancelada';

interface Inscripcion extends InscripcionBase {
  estado: EstadoInscripcion;
  inscripcionId: number; // Suponemos que viene como número de la API
}


const coloresEstados: Record<EstadoInscripcion, {
  bgClass: string;
  textClass: string;
  badgeClass: string;
  borderColor: string;
}> = {
  EnRevision: {
    bgClass: 'bg-warning-subtle',
    textClass: 'text-warning',
    badgeClass: 'bg-warning text-dark',
    borderColor: 'border-warning',
  },
  EnCorreccion: {
    bgClass: 'bg-info-subtle',
    textClass: 'text-info',
    badgeClass: 'bg-info text-dark',
    borderColor: 'border-info',
  },
  Aprobada: {
    bgClass: 'bg-success-subtle',
    textClass: 'text-success',
    badgeClass: 'bg-success text-white',
    borderColor: 'border-success',
  },
  Rechazada: {
    bgClass: 'bg-danger-subtle',
    textClass: 'text-danger',
    badgeClass: 'bg-danger text-white',
    borderColor: 'border-danger',
  },
  Cancelada: {
    bgClass: 'bg-secondary-subtle',
    textClass: 'text-secondary',
    badgeClass: 'bg-secondary text-white',
    borderColor: 'border-secondary',
  },
};

const nombresEstados: Record<string, string> = {
  EnRevision: 'En Revisión',
  EnCorreccion: 'En Corrección',
  Aprobada: 'Aprobadas',
  Rechazada: 'Rechazadas',
  Cancelada: 'Canceladas',
};

const estadosConOrden = ['EnRevision', 'EnCorreccion', 'Aprobada', 'Rechazada', 'Cancelada'];


const InscripcionesAdmin: React.FC = () => {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<string>('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Eliminamos las referencias useRef que solo se usaban para GSAP
  // const containerRef = useRef<HTMLDivElement>(null);
  // const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const datos = await obtenerInscripciones();
        setInscripciones(datos as Inscripcion[]);
      } catch (error) {
        console.error("Error al obtener inscripciones:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);


  const inscripcionesFiltradas = filtro
    ? inscripciones.filter((i) => i.estado === filtro)
    : inscripciones;

  const inscripcionesAgrupadas = estadosConOrden.reduce<Record<string, Inscripcion[]>>(
    (acc, estado) => {
      acc[estado] = inscripcionesFiltradas.filter(ins => ins.estado === estado as EstadoInscripcion);
      return acc;
    },
    {}
  );

  const inscripcionesParaRenderizar = estadosConOrden.flatMap(estado => inscripcionesAgrupadas[estado]);

  const formatearFecha = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatearHora = (fechaISO: string): string => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const toggleExpand = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando inscripciones...</span>
        </div>
        <p className="ms-3 text-secondary">Cargando inscripciones...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="display-4 mb-4 text-center text-dark fw-bold">
        <FaRegIdCard className="text-primary me-3" style={{ fontSize: '1.2em' }} /> Panel de Inscripciones de Equipos
      </h1>

      <div className="card shadow-sm p-4 mb-5">
        <div className="card-body">
          <label htmlFor="filtro" className="form-label h5 text-secondary d-flex align-items-center">
            <FaFilter className="text-primary me-2" /> Filtrar por estado:
          </label>
          <div className="position-relative">
            <select
              id="filtro"
              className="form-select"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="">Mostrar Todos los Estados</option>
              {Object.entries(nombresEstados as Record<EstadoInscripcion, string>).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {inscripcionesParaRenderizar.length === 0 && (
        <div className="alert alert-info text-center mt-5 p-4 rounded-3 shadow-sm" role="alert">
          <h4 className="alert-heading">No hay inscripciones disponibles</h4>
          <p>Asegúrate de que tus criterios de búsqueda sean correctos o prueba con otro estado.</p>
        </div>
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {inscripcionesParaRenderizar.map((ins) => {
          const estadoColor = coloresEstados[ins.estado] || coloresEstados.Cancelada;

          return (
            <div key={String(ins.inscripcionId)} className="col">
              <div className={`card h-100 shadow-sm ${estadoColor.borderColor} border-start border-4 ${estadoColor.bgClass}`}>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge rounded-pill px-3 py-2 fs-6 ${estadoColor.badgeClass}`}>
                      {nombresEstados[ins.estado]}
                    </span>
                    <h5 className="card-title mb-0 text-truncate fw-bold" title={ins.nombreEquipo} style={{ maxWidth: '65%' }}>
                      {ins.nombreEquipo}
                    </h5>
                  </div>
                  <hr className="my-2" />
                  <p className="card-text mb-1">
                    <small className="fw-semibold text-muted">Código:</small> {ins.codigo}
                  </p>
                  <p className="card-text mb-1">
                    <small className="fw-semibold text-muted">Capitán:</small> {ins.nombreCapitan}
                  </p>
                  <p className="card-text mb-1">
                    <small className="fw-semibold text-muted">Correo:</small> {ins.correoCapitan}
                  </p>
                  <p className="card-text mb-1">
                    <small className="fw-semibold text-muted">Fecha:</small> {formatearFecha(ins.fechaInscripcion)}
                  </p>
                  <p className="card-text mb-3">
                    <small className="fw-semibold text-muted">Hora:</small> {formatearHora(ins.fechaInscripcion)}
                  </p>

                  {expandedCardId === String(ins.inscripcionId) && (
                    <div className="mt-3 pt-3 border-top border-secondary-subtle">
                      <p className="card-text fw-semibold mb-2 d-flex align-items-center text-info">
                        <FaInfoCircle className="me-2" /> Descripción:
                      </p>
                      <p className="card-text text-muted small whitespace-pre-wrap">{ins.descripcion || 'Sin descripción'}</p>
                    </div>
                  )}

                  <div className="mt-auto d-flex flex-column flex-sm-row gap-2 pt-3 border-top border-secondary-subtle">
                    <button
                      onClick={() =>
                        navigate(`/admin/inscripciones/${String(ins.inscripcionId)}`, {
                          state: { ...ins },
                        })
                      }
                      className="btn btn-primary w-100"
                    >
                      Ver Detalles Completos
                    </button>
                    <button
                      onClick={() => toggleExpand(String(ins.inscripcionId))}
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                    >
                      {expandedCardId === String(ins.inscripcionId) ? 'Menos Info' : 'Más Info'}
                      {expandedCardId === String(ins.inscripcionId) ? <FaChevronUp className="ms-2" /> : <FaChevronDown className="ms-2" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InscripcionesAdmin;