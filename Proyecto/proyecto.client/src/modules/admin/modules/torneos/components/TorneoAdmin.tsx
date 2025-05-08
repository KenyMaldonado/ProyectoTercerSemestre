import React, { useEffect, useState } from 'react';
import useTournamentData, { Tournament } from '../../../hook/useTournamentData';
import { FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Torneos: React.FC = () => {
  const {
    tournaments,
    subTournamentsMap,
    tiposTorneo,
    fetchTorneos,
    fetchSubTorneos,
    fetchTiposTorneo
  } = useTournamentData();

  const [expanded, setExpanded] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descripcionTipoSeleccionado, setDescripcionTipoSeleccionado] = useState<string>('');

  const [nuevoTorneo, setNuevoTorneo] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    basesTorneo: '',
    fechaInicioInscripcion: '',
    fechaFinInscripcion: '',
    cantidadParticipantes: 0,
    tipoTorneoID: 0,
    ramas: ''
  });

  const toggleExpand = (torneoId: number) => {
    if (expanded === torneoId) {
      setExpanded(null);
    } else {
      setExpanded(torneoId);
      if (!subTournamentsMap[torneoId]) {
        fetchSubTorneos(torneoId);
      }
    }
  };

  const formatoFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  const handleGuardarTorneo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5291/api/TournamentControllers/CreateNewTournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(nuevoTorneo)
      });

      if (response.ok) {
        toast.success("✅ Torneo creado correctamente");
        setMostrarFormulario(false);
        setDescripcionTipoSeleccionado('');
        setNuevoTorneo({
          nombre: '',
          fechaInicio: '',
          fechaFin: '',
          descripcion: '',
          basesTorneo: '',
          fechaInicioInscripcion: '',
          fechaFinInscripcion: '',
          cantidadParticipantes: 0,
          tipoTorneoID: 0,
          ramas: ''
        });
        fetchTorneos();
      } else {
        toast.error("❌ Error al crear el torneo");
      }
    } catch (error) {
      toast.error("❌ Error de conexión");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNuevoTorneo({ ...nuevoTorneo, [name]: value });
  };

  useEffect(() => {
    fetchTiposTorneo();
    fetchTorneos();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎯 {mostrarFormulario ? 'Nuevo Torneo' : 'Torneos actuales'}</h2>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="btn btn-success"
        >
          {mostrarFormulario ? '👁️ Ver Torneos' : '➕ Crear Torneo'}
        </button>
      </div>

      {mostrarFormulario ? (
        <form onSubmit={handleGuardarTorneo} className="bg-light p-4 rounded shadow-sm">
          <div className="mb-2">
            <label>Nombre</label>
            <input name="nombre" className="form-control" value={nuevoTorneo.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>Fecha de inicio</label>
            <input name="fechaInicio" type="date" className="form-control" value={nuevoTorneo.fechaInicio} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>Fecha de fin</label>
            <input name="fechaFin" type="date" className="form-control" value={nuevoTorneo.fechaFin} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>Descripción</label>
            <textarea name="descripcion" className="form-control" value={nuevoTorneo.descripcion} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label>Bases del Torneo</label>
            <textarea name="basesTorneo" className="form-control" value={nuevoTorneo.basesTorneo} onChange={handleChange} rows={3} />
          </div>
          <div className="mb-2">
            <label>Fecha inicio de inscripción</label>
            <input name="fechaInicioInscripcion" type="date" className="form-control" value={nuevoTorneo.fechaInicioInscripcion} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>Fecha fin de inscripción</label>
            <input name="fechaFinInscripcion" type="date" className="form-control" value={nuevoTorneo.fechaFinInscripcion} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>Cantidad de participantes</label>
            <input name="cantidadParticipantes" type="number" className="form-control" value={nuevoTorneo.cantidadParticipantes} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label>Tipo de Torneo</label>
            <div className="d-flex gap-2 align-items-center">
              <select name="tipoTorneoID" className="form-control" value={nuevoTorneo.tipoTorneoID} onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                const tipo = tiposTorneo.find(t => t.tipoTorneoId === selectedId);
                setNuevoTorneo({ ...nuevoTorneo, tipoTorneoID: selectedId });
                setDescripcionTipoSeleccionado(tipo?.descripcionTipoTorneo || '');
              }} required>
                <option value="">Seleccione un tipo</option>
                {tiposTorneo.map(tipo => (
                  <option key={tipo.tipoTorneoId} value={tipo.tipoTorneoId}>
                    {tipo.nombreTipoTorneo}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-outline-info" title="Ver descripción" onClick={() => {
                if (descripcionTipoSeleccionado) {
                  toast.info(descripcionTipoSeleccionado, {
                    position: "top-center",
                    autoClose: 8000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                } else {
                  toast.warn("📌 Primero selecciona un tipo de torneo");
                }
              }}>
                ❔
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label>Rama</label>
            <select name="ramas" className="form-control" value={nuevoTorneo.ramas} onChange={handleChange} required>
              <option value="">Seleccione una rama</option>
              <option value="masculina">Masculina</option>
              <option value="femenina">Femenina</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">💾 Guardar Torneo</button>
        </form>
      ) : (
        <table className="table table-sm table-bordered shadow">
          <thead className="table-success">
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Juego</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Inicio Inscripción</th>
              <th>Fin Inscripción</th>
              <th>Participantes</th>
              <th>Ramas</th>
              <th>Creador</th>
              <th>Estado</th>
              <th>Ver más</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center text-muted">No hay torneos disponibles.</td>
              </tr>
            ) : (
              tournaments.map((t: Tournament) => (
                <React.Fragment key={t.torneoId}>
                  <tr>
                    <td>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => console.log("editar", t.torneoId)}>
                        <FaEdit />
                      </button>
                    </td>
                    <td>{t.nombre}</td>
                    <td>{t.nameTipoTorneo}</td>
                    <td>{t.nameTipoJuego}</td>
                    <td>{formatoFecha(t.fechaInicio)}</td>
                    <td>{formatoFecha(t.fechaFin)}</td>
                    <td>{formatoFecha(t.fechaInicioInscripcion)}</td>
                    <td>{formatoFecha(t.fechaFinInscripcion)}</td>
                    <td>{t.cantidadParticipantes}</td>
                    <td>{t.ramas}</td>
                    <td>{t.creadoPor}</td>
                    <td>{t.estado}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-success" onClick={() => toggleExpand(t.torneoId)}>
                        {expanded === t.torneoId ? "Ocultar" : "Ver"}
                      </button>
                    </td>
                  </tr>
                  {expanded === t.torneoId && (
                    <tr>
                      <td colSpan={13}>
                        <div className="p-3 bg-light rounded">
                          <p><strong>📖 Descripción:</strong> {t.descripcion || '—'}</p>
                          <p><strong>📚 Bases:</strong> {t.basesTorneo || '—'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Torneos;
