import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

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

const DetalleInscripcion: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const ins = location.state as Partial<DatosInscripcion> | undefined;

  const [datos, setDatos] = useState<DatosInscripcion | null>(null);
  const [cargando, setCargando] = useState(true);

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
          `http://localhost:5291/api/TeamManagementControllers/GetInformationRegistration?InscripcionId=${id}`
        );
        const json = await res.json();
        if (json.success) {
          setDatos(json.data);
        }
      } catch (error) {
        console.error('Error al obtener detalles:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchDetalle();
  }, [id]);

  if (cargando) return <div className="text-center mt-4">Cargando detalles...</div>;
  if (!datos && !ins) return <div className="text-danger text-center mt-4">No se encontró la inscripción.</div>;

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4 text-center">Formulario Detalle de Inscripción</h2>

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
            <input type="text" className="form-control" value={mostrarDato('estado')} disabled />
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
        <button className="btn btn-success" onClick={() => alert('✅ Inscripción confirmada')}>
          Confirmar inscripción
        </button>
        <button className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#modalCorrecciones">
          Requiere correcciones
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (window.confirm('¿Estás seguro de que deseas rechazar esta inscripción definitivamente?')) {
              alert('❌ Inscripción rechazada definitivamente');
            }
          }}
        >
          Rechazar inscripción
        </button>
      </div>

      {/* MODAL PARA CORRECCIONES */}
      <div
        className="modal fade"
        id="modalCorrecciones"
        tabIndex={-1}
        aria-labelledby="modalCorreccionesLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalCorreccionesLabel">Observaciones del administrador</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <label htmlFor="motivo" className="form-label">Motivo de corrección:</label>
              <textarea id="motivo" className="form-control" rows={4}></textarea>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  const motivo = (document.getElementById('motivo') as HTMLTextAreaElement)?.value;
                  if (!motivo.trim()) {
                    alert('Debes ingresar una observación.');
                    return;
                  }
                  alert(`⚠️ Inscripción enviada a corrección: ${motivo}`);
                  (document.getElementById('motivo') as HTMLTextAreaElement).value = '';
                  (document.getElementById('modalCorrecciones') as any)?.classList?.remove('show');
                }}
              >
                Enviar observación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleInscripcion;