import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { updateEstadoInscripcion, EstadoInscripcionUpdate } from '../../../services/api'; 
import Swal from 'sweetalert2'; 

interface Jugador {
  nombre: string;
  apellido: string;
  carne: number;
  edad: number;
  fotoPerfil?: string | null;
  asignacion: {
    posicionName: string;
    dorsal: number;
  };
}

interface InfoEquipo {
  nombre: string;
  colorUniforme: string;
  colorUniformeSecundario: string;
  imagenEquipo: string;
  nameFacultad: string;
}

interface DatosInscripcion {
  inscripcionID: number;
  estado: string;
  fechaInscripcion: string;
  nombreTorneo: string;
  nombreSubtorneo: string;
  descripcion: string;
  codigo: string;
  nombreEquipo: string;
  nombreCapitan: string;
  apellidoCapitan?: string;
  correoCapitan: string;
  infoEquipo: InfoEquipo;
  jugadores: Jugador[];
}

type CamposSimples =
  | 'estado'
  | 'fechaInscripcion'
  | 'nombreTorneo'
  | 'nombreSubtorneo'
  | 'descripcion'
  | 'codigo'
  | 'nombreEquipo'
  | 'nombreCapitan'
  | 'apellidoCapitan'
  | 'correoCapitan';

type EstadoInscripcionDetalle = 'EnRevision' | 'EnCorreccion' | 'Aprobada' | 'Rechazada' | 'Cancelada';

const coloresEstadosDetalle: Record<EstadoInscripcionDetalle, {
  textClass: string;
  badgeClass: string;
}> = {
  EnRevision: {
    textClass: 'text-warning',
    badgeClass: 'bg-warning text-dark',
  },
  EnCorreccion: {
    textClass: 'text-info', // Opcional: 'text-primary' para un azul más oscuro
    badgeClass: 'bg-info text-dark', // Opcional: 'bg-primary text-white'
  },
  Aprobada: {
    textClass: 'text-success',
    badgeClass: 'bg-success text-white',
  },
  Rechazada: {
    textClass: 'text-danger',
    badgeClass: 'bg-danger text-white',
  },
  Cancelada: {
    textClass: 'text-secondary',
    badgeClass: 'bg-secondary text-white',
  },
};

const DetalleInscripcion: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const ins = location.state as Partial<DatosInscripcion> | undefined;

  const [datos, setDatos] = useState<DatosInscripcion | null>(null);
  const [cargando, setCargando] = useState(true);
  // Eliminado: const [comentarioCorreccion, setComentarioCorreccion] = useState<string>(''); // No se usa directamente

  const mostrarDato = (campo: CamposSimples) => {
    if (datos && datos[campo] !== undefined && datos[campo] !== null) return datos[campo];
    if (ins && ins[campo] !== undefined && ins[campo] !== null) return ins[campo];
    return '';
  };

  const mostrarDatoEquipo = (campo: keyof InfoEquipo) => {
    if (datos?.infoEquipo && datos.infoEquipo[campo]) return datos.infoEquipo[campo];
    return '';
  };

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const res = await fetch(
          `https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/TeamManagementControllers/GetInformationRegistration?InscripcionId=${id}`
        );
        const json = await res.json();
        if (json.success) {
          setDatos(json.data);
        } else {
          console.warn('API respondió success: false o sin datos.', json);
          setDatos(null);
          Swal.fire('Error', 'No se pudo cargar la información de la inscripción.', 'error');
        }
      } catch (error) {
        console.error('Error al obtener detalles:', error);
        setDatos(null);
        Swal.fire('Error', 'Hubo un problema de conexión al cargar los detalles de la inscripción.', 'error');
      } finally {
        setCargando(false);
      }
    };

    fetchDetalle();
  }, [id]);

  const handleUpdateEstado = async (estado: EstadoInscripcionUpdate, comentario: string = '') => {
    if (!datos?.inscripcionID) {
      Swal.fire('Error', 'No se pudo obtener el ID de la inscripción.', 'error');
      return false;
    }

    const success = await updateEstadoInscripcion(datos.inscripcionID, estado, comentario);

    if (success) {
      // Usar un mapeo para el mensaje si es necesario, pero `estado` aquí siempre será 'Aprobada', 'Rechazada' o 'EnCorreccion'
      const estadoDisplay = estado === 'EnCorreccion' ? 'En Corrección' : estado; 
      Swal.fire('¡Éxito!', `Estado de inscripción actualizado a: ${estadoDisplay}`, 'success');
      
      // Refrescar los datos después de la actualización exitosa
      setCargando(true);
      try {
        const res = await fetch(`https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/TeamManagementControllers/GetInformationRegistration?InscripcionId=${id}`);
        const json = await res.json();
        if (json.success) {
          setDatos(json.data);
        } else {
          console.warn('API respondió success: false al refrescar datos.', json);
          setDatos(null);
          Swal.fire('Error', 'No se pudo refrescar la información de la inscripción después de la actualización.', 'error');
        }
      } catch (error) {
        console.error('Error al refrescar datos:', error);
        Swal.fire('Error', 'Hubo un problema de conexión al refrescar los detalles de la inscripción.', 'error');
      } finally {
        setCargando(false);
      }
      return true;
    } else {
      Swal.fire('Error', 'Hubo un error al actualizar el estado de la inscripción. Intenta de nuevo.', 'error');
      return false;
    }
  };

  const handleConfirmarInscripcion = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas aprobar esta inscripción?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      handleUpdateEstado('Aprobada', 'Felicidades, se ha aprobado su inscripción. ¡Mucha suerte en el torneo!');
    }
  };

  const handleRechazarInscripcion = async () => {
    const { value: motivoRechazo } = await Swal.fire({
      title: 'Rechazar Inscripción',
      input: 'textarea',
      inputLabel: 'Por favor, ingresa el motivo del rechazo:',
      inputPlaceholder: 'Ingresa aquí el motivo...',
      inputAttributes: {
        'aria-label': 'Ingresa el motivo del rechazo',
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '¡El motivo del rechazo no puede estar vacío!';
        }
        return null;
      }
    });

    if (motivoRechazo) {
      handleUpdateEstado('Rechazada', motivoRechazo);
    }
  };

  const handleEnviarCorreccion = async () => {
    // Ya no necesitas manipular el modal de Bootstrap directamente aquí
    // const modalElement = document.getElementById('modalCorrecciones');
    // if (modalElement) {
    //   const bsModal = (window as any).bootstrap.Modal.getInstance(modalElement);
    //   if (bsModal) bsModal.hide();
    // }

    const { value: observaciones } = await Swal.fire({
      title: 'Enviar a Corrección',
      input: 'textarea',
      inputLabel: 'Por favor, ingresa las observaciones para la corrección:',
      inputPlaceholder: 'Describe los cambios necesarios...',
      inputAttributes: {
        'aria-label': 'Ingresa las observaciones',
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '¡Las observaciones no pueden estar vacías!';
        }
        return null;
      }
    });

    if (observaciones) {
      handleUpdateEstado('EnCorreccion', observaciones);
    }
  };


  if (cargando) return <div className="text-center mt-4">Cargando detalles...</div>;
  if (!datos && !ins) return <div className="text-danger text-center mt-4">No se encontró la inscripción.</div>;

  const estadoActual = (datos?.estado || ins?.estado || '') as EstadoInscripcionDetalle;
  const estiloEstado = coloresEstadosDetalle[estadoActual] || { textClass: 'text-dark', badgeClass: 'bg-secondary text-white' };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4 text-center">
        Formulario Detalle de Inscripción
        {estadoActual && (
          <span className={`ms-3 badge ${estiloEstado.badgeClass}`}>
            {estadoActual === 'EnRevision' ? 'En Revisión' : estadoActual}
          </span>
        )}
      </h2>

      {/* INFORMACIÓN GENERAL */}
      <div className="card shadow p-4 mb-4">
        <h4 className="mb-3">Información General</h4>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Código</label>
            <input type="text" className="form-control" value={mostrarDato('codigo')} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label">Estado</label>
            <input type="text" className={`form-control ${estiloEstado.textClass} fw-bold`} value={mostrarDato('estado')} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label">Fecha de Inscripción</label>
            <input
              type="text"
              className="form-control"
              value={mostrarDato('fechaInscripcion') ? new Date(mostrarDato('fechaInscripcion') as string).toLocaleDateString() : ''}
              disabled
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Torneo</label>
            <input type="text" className="form-control" value={mostrarDato('nombreTorneo')} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label">Subtorneo</label>
            <input type="text" className="form-control" value={mostrarDato('nombreSubtorneo')} disabled />
          </div>
          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" value={mostrarDato('descripcion')} disabled />
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DEL CAPITÁN */}
      <div className="card shadow p-4 mb-4">
        <h4 className="mb-3">Información del Capitán</h4>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Nombre del Capitán</label>
            <input type="text" className="form-control" value={mostrarDato('nombreCapitan')} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label">Apellido del Capitán</label>
             <input type="text" className="form-control" value={mostrarDato('apellidoCapitan')} disabled />
          </div>
          <div className="col-md-4">
          <label className="form-label">Correo del Capitán</label>
            <input type="email" className="form-control" value={mostrarDato('correoCapitan')} disabled />
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DEL EQUIPO */}
      <div className="card shadow p-4 mb-4">
        <h4 className="mb-3">Equipo</h4>
        <div className="row g-3">
          <div className="col-md-8">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre del Equipo</label>
                <input type="text" className="form-control" value={mostrarDatoEquipo('nombre')} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">Facultad</label>
                <input type="text" className="form-control" value={mostrarDatoEquipo('nameFacultad')} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">Color del Uniforme</label>
                <input type="text" className="form-control" value={mostrarDatoEquipo('colorUniforme')} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">Color Uniforme Secundario</label>
                <input type="text" className="form-control" value={mostrarDatoEquipo('colorUniformeSecundario')} disabled />
              </div>
            </div>
          </div>
          <div className="col-md-4 text-center">
            {datos?.infoEquipo?.imagenEquipo ? (
              <img
                src={datos.infoEquipo.imagenEquipo}
                alt="Imagen del Equipo"
                className="img-fluid rounded border"
                style={{ maxHeight: '180px', objectFit: 'cover' }}
              />
            ) : (
              <div>No hay imagen disponible</div>
            )}
          </div>
        </div>
      </div>

      {/* JUGADORES */}
      <div className="card shadow p-4">
        <h4 className="mb-3">Jugadores</h4>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
          {(datos?.jugadores ?? []).map((jugador, index) => (
            <div key={index} className="col">
              <div className="card h-100 border rounded shadow-sm">
                <div className="card-body text-center">
                  <img
                    src={jugador.fotoPerfil ?? 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'}
                    alt={`${jugador.nombre} ${jugador.apellido}`}
                    className="rounded-circle mb-2"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <h6 className="mb-1">{jugador.nombre} {jugador.apellido}</h6>
                  <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>Carné: {jugador.carne}</p>
                  <p className="mb-1" style={{ fontSize: '0.85rem' }}>Edad: {jugador.edad}</p>
                  <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                    Posición: <strong>{jugador.asignacion?.posicionName}</strong><br />
                    Dorsal: <strong>{jugador.asignacion?.dorsal}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTONES */}
      <div className="mt-4 d-flex justify-content-center gap-3">
        {estadoActual === 'EnRevision' && (
          <>
            <button className="btn btn-success" onClick={handleConfirmarInscripcion}>
              Confirmar inscripción
            </button>
            <button className="btn btn-warning" onClick={handleEnviarCorreccion}>
              Requiere correcciones
            </button>
            <button
              className="btn btn-danger"
              onClick={handleRechazarInscripcion}
            >
              Rechazar inscripción
            </button>
          </>
        )}
        {/* Botón de Regresar */}
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/inscripciones')}>
          Regresar a Inscripciones
        </button>
      </div>

      {/* El modal de Bootstrap ya no es necesario, se eliminó para evitar los errores */}
    </div>
  );
};

export default DetalleInscripcion;