import React, { useEffect, useState } from 'react';
import useTournamentData, { Tournament } from '../../../hook/useTournamentData';
import { FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface TipoJuego {
tipoJuegoId: number;
nombre: string;
descripcion: string;
}

const Torneos: React.FC = () => {
const {
tournaments,
subTournamentsMap,
tiposTorneo,
fetchTorneos,
fetchSubTorneos,
fetchTiposTorneo

} = useTournamentData();

const [tiposJuego, setTiposJuego] = useState<TipoJuego[]>([]);
const [descripcionTipoSeleccionado, setDescripcionTipoSeleccionado] = useState('');
const [descripcionJuegoSeleccionado, setDescripcionJuegoSeleccionado] = useState('');
const [mostrarFormulario, setMostrarFormulario] = useState(false);
const [expanded, setExpanded] = useState<number | null>(null);
const [archivoPDF, setArchivoPDF] = useState<File | null>(null);

const [nuevoTorneo, setNuevoTorneo] = useState({
nombre: '',
fechaInicio: '',
fechaFin: '',
descripcion: '',
fechaInicioInscripcion: '',
fechaFinInscripcion: '',
tipoTorneoID: 0,
tipoJuegoID: 0,
ramas: [] as string[],
cantidadParticipantes: ''
});

const formatoFecha = (fecha: string) =>
new Date(fecha).toLocaleDateString('es-GT', {
year: 'numeric', month: 'short', day: '2-digit'
});

const tipoTorneoRestringido = (): boolean => {
  const tipo = tiposTorneo.find(t => t.tipoTorneoId === nuevoTorneo.tipoTorneoID);
  const nombre = tipo?.nombreTipoTorneo?.toLowerCase() || '';
  return nombre.includes('liga') && !nombre.includes('eliminatoria');
};


const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (file) {
if (file.type !== "application/pdf") {
toast.warning("📄 Solo se permite archivos PDF.");
return;
}
if (file.size > 5 * 1024 * 1024) {
toast.warning("❌ El archivo no debe superar los 5 MB.");
return;
}
setArchivoPDF(file);
}
};

const handleGuardarTorneo = async (e: React.FormEvent) => {
e.preventDefault();

if (!archivoPDF) {
  toast.warn("📎 Debes adjuntar un archivo PDF con las bases del torneo.");
  return;
}

const formData = new FormData();
formData.append("nombre", nuevoTorneo.nombre);
formData.append("fechaInicio", nuevoTorneo.fechaInicio);
formData.append("fechaFin", nuevoTorneo.fechaFin);
formData.append("descripcion", nuevoTorneo.descripcion);
formData.append("fechaInicioInscripcion", nuevoTorneo.fechaInicioInscripcion);
formData.append("fechaFinInscripcion", nuevoTorneo.fechaFinInscripcion);
formData.append("tipoTorneoID", nuevoTorneo.tipoTorneoID.toString());
formData.append("tipoJuegoID", nuevoTorneo.tipoJuegoID.toString());
formData.append("cantidadParticipantes", nuevoTorneo.cantidadParticipantes);
nuevoTorneo.ramas.forEach((rama, index) => {
  formData.append(`ramas[${index}]`, rama);
});
formData.append("archivoPDF", archivoPDF); // enviar archivo

try {
  const response = await fetch("http://localhost:5291/api/TournamentControllers/CreateNewTournament", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`
    },
    body: formData
  });

  if (response.ok) {
    toast.success("✅ Torneo creado correctamente");
    setMostrarFormulario(false);
    setArchivoPDF(null);
    setNuevoTorneo({
  nombre: '', 
  fechaInicio: '', 
  fechaFin: '', 
  descripcion: '',
  fechaInicioInscripcion: '', 
  fechaFinInscripcion: '', 
  tipoTorneoID: 0,
  tipoJuegoID: 0, 
  ramas: [],
  cantidadParticipantes: ''
});

    fetchTorneos();
  } else {
    toast.error("❌ Error al crear el torneo");
  }
} catch {
  toast.error("❌ Error de conexión");
}
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
const { name, value } = e.target;
setNuevoTorneo({ ...nuevoTorneo, [name]: value });
};

const handleCheckbox = (rama: string) => {
setNuevoTorneo(prev => {
const isSelected = prev.ramas.includes(rama);
return {
...prev,
ramas: isSelected ? prev.ramas.filter(r => r !== rama) : [...prev.ramas, rama]
};
});
};

const toggleExpand = (torneoId: number) => {
setExpanded(expanded === torneoId ? null : torneoId);
if (!subTournamentsMap[torneoId]) fetchSubTorneos(torneoId);
};

const fetchTiposJuego = async () => {
const res = await fetch("http://localhost:5291/api/TournamentControllers/GetTournamentGameTypes");
const data = await res.json();
if (data.success) setTiposJuego(data.data);
};

useEffect(() => {
fetchTorneos();
fetchTiposTorneo();
fetchTiposJuego();
}, []);

return (
<div className="container mt-4">
<div className="d-flex justify-content-between align-items-center mb-4">
<h2>🎯 {mostrarFormulario ? 'Nuevo Torneo' : 'Torneos actuales'}</h2>
<button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="btn btn-success">
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
      <div className="mb-3">
        <label>Archivo PDF con Bases del Torneo (máx 5MB)</label>
        <input type="file" accept=".pdf" className="form-control" onChange={handleFileChange} required />
      </div>
      <div className="mb-2">
        <label>Fecha inicio de inscripción</label>
        <input name="fechaInicioInscripcion" type="date" className="form-control" value={nuevoTorneo.fechaInicioInscripcion} onChange={handleChange} required />
      </div>
      <div className="mb-2">
        <label>Fecha fin de inscripción</label>
        <input name="fechaFinInscripcion" type="date" className="form-control" value={nuevoTorneo.fechaFinInscripcion} onChange={handleChange} required />
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
          <button type="button" className="btn btn-outline-info" onClick={() => {
            toast.info(descripcionTipoSeleccionado || '📌 Selecciona un tipo de torneo primero', {
              position: 'top-center', autoClose: 8000
            });
          }}>❔</button>
        </div>
      </div>
      <div className="mb-3">
        <label>Tipo de Juego</label>
        <div className="d-flex gap-2 align-items-center">
          <select name="tipoJuegoID" className="form-control" value={nuevoTorneo.tipoJuegoID} onChange={(e) => {
            const selectedId = parseInt(e.target.value);
            const juego = tiposJuego.find(j => j.tipoJuegoId === selectedId);
            setNuevoTorneo({ ...nuevoTorneo, tipoJuegoID: selectedId });
            setDescripcionJuegoSeleccionado(juego?.descripcion || '');
          }} required>
            <option value="">Seleccione un tipo de juego</option>
            {tiposJuego.map(j => (
              <option key={j.tipoJuegoId} value={j.tipoJuegoId}>{j.nombre}</option>
            ))}
          </select>
          <button type="button" className="btn btn-outline-info" onClick={() => {
            toast.info(descripcionJuegoSeleccionado || '📌 Selecciona un tipo de juego primero', {
              position: 'top-center', autoClose: 8000
            });
          }}>❔</button>
        </div>
      </div>
      <div className="mb-3">
        <label>Ramas</label>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" checked={nuevoTorneo.ramas.includes('masculina')} onChange={() => handleCheckbox('masculina')} id="ramaMasculina" />
          <label className="form-check-label" htmlFor="ramaMasculina">Masculina</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" checked={nuevoTorneo.ramas.includes('femenina')} onChange={() => handleCheckbox('femenina')} id="ramaFemenina" />
          <label className="form-check-label" htmlFor="ramaFemenina">Femenina</label>
        </div>

        <div className="mb-3">
  <label>Cantidad de Participantes</label>
  {tipoTorneoRestringido() ? (
    <select
      name="cantidadParticipantes"
      className="form-control"
      value={nuevoTorneo.cantidadParticipantes}
      onChange={handleChange}
      required
    >
      <option value="">Seleccione una cantidad</option>
      <option value="4">4</option>
      <option value="8">8</option>
      <option value="16">16</option>
      <option value="32">32</option>
    </select>
  ) : (
    <input
      type="number"
      name="cantidadParticipantes"
      className="form-control"
      value={nuevoTorneo.cantidadParticipantes}
      onChange={handleChange}
      placeholder="Ej. 10, 12, 20..."
      min={2}
      required
    />
  )}
</div>
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
      <th>Creador</th>
      <th>Estado</th>
      <th>Ver más</th>
    </tr>
  </thead>
  <tbody>
    {tournaments.length === 0 ? (
      <tr>
        <td colSpan={11} className="text-center text-muted">No hay torneos disponibles.</td>
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
              <td colSpan={11}>
                <div className="p-3 bg-light rounded">
                  <p><strong>📖 Descripción:</strong> {t.descripcion || '—'}</p>
                  <p>
                    <strong>📚 Bases:</strong>{' '}
                    {t.basesTorneo ? (
                      <a href={t.basesTorneo} target="_blank" rel="noopener noreferrer">
                        Ver documento
                      </a>
                    ) : '—'}
                  </p>
                  {subTournamentsMap[t.torneoId] && subTournamentsMap[t.torneoId].length > 0 ? (
                    <div className="mt-3">
                      <h6>🏆 Subtorneos:</h6>
                      <table className="table table-sm table-bordered mb-0">
                        <thead className="table-success">
                          <tr>
                            <th>🏷️ Categoría</th>
                            <th>📌 Estado</th>
                            <th>👥 Equipos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subTournamentsMap[t.torneoId].map((sub) => (
                            <tr key={sub.subTorneoId}>
                              <td>{sub.categoria}</td>
                              <td>{sub.estado}</td>
                              <td>{sub.cantidadEquipos}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted m-0">No hay subtorneos registrados o aún se están cargando.</p>
                  )}
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