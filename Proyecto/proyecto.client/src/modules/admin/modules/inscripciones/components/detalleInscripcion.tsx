import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

interface Jugador {
  nombre: string;
  apellido: string;
  carne: number;
  edad: number;
  asignacion: {
    posicionName: string;
    dorsal: number;
  };
}

interface InfoEquipo {
  nombre: string;
  colorUniforme: string;
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
  apellidoCapitan?: string; // Agregado para apellido si lo usas en el formulario
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

  // Función para obtener datos simples (string o number) con fallback entre datos y estado previo (ins)
  const mostrarDato = (campo: CamposSimples) => {
    // Primero intentamos datos del API, si no existe fallback a ins (estado previo)
    if (datos && datos[campo] !== undefined && datos[campo] !== null) return datos[campo];
    if (ins && ins[campo] !== undefined && ins[campo] !== null) return ins[campo];
    return '';
  };

  // Función para datos del objeto infoEquipo
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
              value={
                mostrarDato('fechaInscripcion')
                  ? new Date(mostrarDato('fechaInscripcion') as string).toLocaleDateString()
                  : ''
              }
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
            </div>
          </div>
          <div className="col-md-4 text-center">
            <label className="form-label">Imagen del Equipo</label>
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

      <div className="card shadow p-4">
        <h4 className="mb-3">Jugadores</h4>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Carné</th>
                <th>Edad</th>
                <th>Posición</th>
                <th>Dorsal</th>
              </tr>
            </thead>
            <tbody>
              {(datos?.jugadores ?? []).map((jugador, index) => (
                <tr key={index}>
                  <td>{jugador.nombre}</td>
                  <td>{jugador.apellido}</td>
                  <td>{jugador.carne}</td>
                  <td>{jugador.edad}</td>
                  <td>{jugador.asignacion?.posicionName}</td>
                  <td>{jugador.asignacion?.dorsal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetalleInscripcion;
