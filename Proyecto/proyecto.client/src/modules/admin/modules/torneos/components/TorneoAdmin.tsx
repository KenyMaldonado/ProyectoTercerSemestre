import React, { useEffect, useState, useCallback } from 'react'; // Importa useCallback
import useTournamentData, { Tournament } from '../../../hook/useTournamentData';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface TipoJuego {
  tipoJuegoId: number;
  nombre: string;
  descripcion: string;
}

// Interfaz para TipoTorneo (si no la tienes en useTournamentData)
interface TipoTorneo {
  tipoTorneoId: number;
  nombreTipoTorneo: string;
}


const Torneos: React.FC = () => {
  const navigate = useNavigate();
  const {
    tournaments,
    subTournamentsMap,
    tiposTorneo, // Esto ya viene del hook
    fetchTorneos,
    fetchSubTorneos,
    fetchTiposTorneo,
  } = useTournamentData();

  const [tiposJuego, setTiposJuego] = useState<TipoJuego[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

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
    participantesPorRama: {
      masculina: '',
      femenina: ''
    }
  });

  // --- NUEVO ESTADO PARA LOS NOMBRES EN EL RESUMEN ---
  // Guardaremos los nombres directamente cuando las validaciones pasen
  const [resumenNombres, setResumenNombres] = useState({
    tipoTorneoNombre: 'N/A',
    tipoJuegoNombre: 'N/A'
  });
  // --- FIN NUEVO ESTADO ---

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatoFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric', month: 'short', day: '2-digit'
    });

  const tipoTorneoRestringido = (): boolean => {
    const tipo = tiposTorneo.find(t => t.tipoTorneoId === Number(nuevoTorneo.tipoTorneoID));
    const nombre = tipo?.nombreTipoTorneo?.toLowerCase() || '';
    return nombre.includes('eliminatoria');
  };

  const subtorneos = nuevoTorneo.ramas.map(rama => ({
    torneoID: 0,
    categoria: rama,
    cantidadEquipos: Number(nuevoTorneo.participantesPorRama[rama as 'masculina' | 'femenina']) || 0
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.warning('📄 Solo se permite archivos PDF.');
        setArchivoPDF(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('❌ El archivo no debe superar los 5 MB.');
        setArchivoPDF(null);
        return;
      }
      setArchivoPDF(file);
    }
  };

  const handleOpenSummary = (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivoPDF) {
      toast.warning("📎 Debes seleccionar un archivo PDF.");
      return;
    }

    const hoy = new Date();
    const inicioTorneo = new Date(nuevoTorneo.fechaInicio);
    const finTorneo = new Date(nuevoTorneo.fechaFin);
    const inicioInscripcion = new Date(nuevoTorneo.fechaInicioInscripcion);
    const finInscripcion = new Date(nuevoTorneo.fechaFinInscripcion);

    if (inicioTorneo < hoy) { toast.warning("📅 La fecha de inicio del torneo no puede ser menor a la fecha actual."); return; }
    if (inicioInscripcion >= inicioTorneo) { toast.warning("🚫 La fecha de inicio de inscripción debe ser antes del inicio del torneo."); return; }
    if (finInscripcion >= inicioTorneo) { toast.warning("🚫 La fecha fin de inscripción debe ser antes del inicio del torneo."); return; }
    if (nuevoTorneo.fechaInicio === nuevoTorneo.fechaFin) { toast.warning("🚫 La fecha de inicio y fin del torneo no pueden ser iguales."); return; }
    if (finTorneo < finInscripcion) { toast.warning("📅 La fecha de finalización del torneo no puede ser menor a la fecha fin de inscripción."); return; }
    if (finTorneo < inicioTorneo) { toast.warning("📅 La fecha de finalización del torneo no puede ser menor a la fecha de inicio del torneo."); return; }
    if (finInscripcion < inicioInscripcion) { toast.warning("📅 La fecha fin de inscripción no puede ser menor a la fecha inicio de inscripción."); return; }

    if (nuevoTorneo.ramas.length === 0) {
      toast.warning("⚽ Debes seleccionar al menos una rama (Masculina/Femenina).");
      return;
    }
    for (const rama of nuevoTorneo.ramas) {
      if (!nuevoTorneo.participantesPorRama[rama as 'masculina' | 'femenina']) {
        toast.warning(`🔢 Debes especificar la cantidad de participantes para la rama ${rama}.`);
        return;
      }
    }
    if (nuevoTorneo.tipoTorneoID === 0) {
      toast.warning("🏆 Debes seleccionar un tipo de torneo.");
      return;
    }
    if (nuevoTorneo.tipoJuegoID === 0) {
      toast.warning("🎮 Debes seleccionar un tipo de juego.");
      return;
    }

    // --- AQUÍ ESTÁ EL CAMBIO CRUCIAL ---
    // Antes de abrir el modal, actualiza los nombres en el estado de resumen
    const tipoTorneoDisplay = tiposTorneo.find(t => t.tipoTorneoId === Number(nuevoTorneo.tipoTorneoID))?.nombreTipoTorneo || 'N/A';
    const tipoJuegoDisplay = tiposJuego.find(j => j.tipoJuegoId === Number(nuevoTorneo.tipoJuegoID))?.nombre || 'N/A';

    setResumenNombres({
      tipoTorneoNombre: tipoTorneoDisplay,
      tipoJuegoNombre: tipoJuegoDisplay
    });
    // --- FIN CAMBIO ---

    setShowSummaryModal(true);
  };

  const handleGuardarTorneo = async () => {
    setShowSummaryModal(false);
    setSubiendo(true);

    let pdfUrl = '';
    try {
      const formData = new FormData();
      formData.append("file", archivoPDF as File);

      const responsePDF = await fetch("https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/TournamentControllers/UploadBasesTournaments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: formData
      });

      const result = await responsePDF.json();
      if (result.success) {
        pdfUrl = result.data.fileUrl;
      } else {
        toast.error("❌ Error al subir el PDF");
        setSubiendo(false);
        return;
      }
    } catch (error) {
      console.error("❌ Error al subir el PDF:", error);
      toast.error("❌ Error de conexión al subir el PDF");
      setSubiendo(false);
      return;
    }

    const torneoData = {
      ...nuevoTorneo,
      basesTorneo: pdfUrl,
      ramas: nuevoTorneo.ramas,
      subtorneos
    };

    try {
      const response = await fetch("https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/TournamentControllers/CreateNewTournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(torneoData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Torneo creado correctamente!',
          text: 'El torneo ha sido registrado con éxito.',
          showConfirmButton: false,
          timer: 2500
        });

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
          participantesPorRama: { masculina: '', femenina: '' }
        });

        fetchTorneos();
      } else {
        const errorText = await response.text();
        console.error("❌ Error del backend:", errorText);
        let errorMessage = 'Error al crear el torneo. Por favor verifica los datos o intenta más tarde.';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Si no es un JSON válido, usamos el errorText original
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al crear el torneo',
          text: errorMessage
        });
      }
    } catch (error) {
      console.error("❌ Error de red:", error);
      toast.error("❌ Error de conexión al intentar crear el torneo.");
    } finally {
      setSubiendo(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setNuevoTorneo(prev => {
      const updatedTorneo = { ...prev, [name]: value };

      const hoy = getTodayDate();

      if (name === 'fechaInicioInscripcion') {
        if (value && new Date(value) < new Date(hoy)) {
          toast.warning("🚫 La fecha inicio de inscripción no puede ser menor a la fecha actual.");
        }
        if (updatedTorneo.fechaFinInscripcion && new Date(updatedTorneo.fechaFinInscripcion) < new Date(value)) {
          updatedTorneo.fechaFinInscripcion = value;
        }
        if (updatedTorneo.fechaInicio && new Date(updatedTorneo.fechaInicio) <= new Date(value)) {
          updatedTorneo.fechaInicio = '';
          toast.warning("🚫 La fecha de inicio del torneo debe ser posterior a la fecha de inicio de inscripción.");
        }
      }

      if (name === 'fechaFinInscripcion') {
        if (value && updatedTorneo.fechaInicioInscripcion && new Date(value) < new Date(updatedTorneo.fechaInicioInscripcion)) {
          toast.warning("🚫 La fecha fin de inscripción no puede ser menor a la fecha inicio de inscripción.");
        }
        if (updatedTorneo.fechaInicio && new Date(updatedTorneo.fechaInicio) <= new Date(value)) {
          updatedTorneo.fechaInicio = '';
          toast.warning("🚫 La fecha de inicio del torneo debe ser posterior a la fecha de fin de inscripción.");
        }
      }

      if (name === 'fechaInicio') {
        if (value && new Date(value) < new Date(hoy)) {
          toast.warning("🚫 La fecha de inicio del torneo no puede ser menor a la fecha actual.");
        }
        if (value && updatedTorneo.fechaFinInscripcion && new Date(value) <= new Date(updatedTorneo.fechaFinInscripcion)) {
          toast.warning("🚫 La fecha de inicio del torneo debe ser posterior a la fecha de fin de inscripción.");
        }
        if (updatedTorneo.fechaFin && new Date(updatedTorneo.fechaFin) < new Date(value)) {
          updatedTorneo.fechaFin = value;
        }
      }

      if (name === 'fechaFin') {
        if (value && updatedTorneo.fechaInicio && new Date(value) < new Date(updatedTorneo.fechaInicio)) {
          toast.warning("🚫 La fecha de fin del torneo no puede ser menor a la fecha de inicio del torneo.");
        }
      }

      return updatedTorneo;
    });
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

  // Mantén fetchTiposJuego como está, pero asegúrate de que useTournamentData
  // también exponga la función fetchTiposTorneo (ya lo hace)
  const fetchTiposJuego = useCallback(async () => {
    try {
      const res = await fetch('https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/TournamentControllers/GetTournamentGameTypes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}` // Añade el token aquí
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setTiposJuego(data.data);
      } else {
        toast.error('Error al cargar tipos de juego: ' + (data.message || 'Desconocido'));
      }
    } catch (err) {
      console.error('Error al obtener tipos de juego:', err);
      toast.error('Error de conexión al obtener tipos de juego.');
    }
  }, []);


  useEffect(() => {
    fetchTorneos();
    fetchTiposTorneo(); // Carga los tipos de torneo desde el hook
    fetchTiposJuego(); // Carga los tipos de juego
  }, [fetchTorneos, fetchTiposTorneo, fetchTiposJuego]); // Asegura que las dependencias estén correctas

  useEffect(() => {
    console.log("🔍 Torneos cargados:", tournaments);
    console.log("🔍 Tipos de Torneo cargados:", tiposTorneo); // Verifica esto
    console.log("🔍 Tipos de Juego cargados:", tiposJuego); // Verifica esto
  }, [tournaments, tiposTorneo, tiposJuego]);


  const todayDate = getTodayDate();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎯 {mostrarFormulario ? 'Nuevo Torneo' : 'Torneos actuales'}</h2>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="btn btn-success">
          {mostrarFormulario ? '👁️ Ver Torneos' : '➕ Crear Torneo'}
        </button>
      </div>

      {mostrarFormulario ? (
        <form onSubmit={handleOpenSummary} className="bg-light p-4 rounded shadow-sm">
          <div className="mb-2">
            <label>Nombre</label>
            <input name="nombre" className="form-control" value={nuevoTorneo.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>Fecha inicio de inscripción</label>
            <input
              name="fechaInicioInscripcion"
              type="date"
              className="form-control"
              value={nuevoTorneo.fechaInicioInscripcion}
              onChange={handleChange}
              required
              min={todayDate}
              max={nuevoTorneo.fechaInicio}
            />
          </div>
          <div className="mb-2">
            <label>Fecha fin de inscripción</label>
            <input
              name="fechaFinInscripcion"
              type="date"
              className="form-control"
              value={nuevoTorneo.fechaFinInscripcion}
              onChange={handleChange}
              required
              min={nuevoTorneo.fechaInicioInscripcion || todayDate}
              max={nuevoTorneo.fechaInicio}
            />
          </div>
          <div className="mb-2">
            <label>Fecha de inicio del torneo</label>
            <input
              name="fechaInicio"
              type="date"
              className="form-control"
              value={nuevoTorneo.fechaInicio}
              onChange={handleChange}
              required
              min={nuevoTorneo.fechaFinInscripcion ? nuevoTorneo.fechaFinInscripcion : todayDate}
            />
          </div>
          <div className="mb-2">
            <label>Fecha de fin del torneo</label>
            <input
              name="fechaFin"
              type="date"
              className="form-control"
              value={nuevoTorneo.fechaFin}
              onChange={handleChange}
              required
              min={nuevoTorneo.fechaInicio}
            />
          </div>
          <div className="mb-2">
            <label>Descripción</label>
            <textarea name="descripcion" className="form-control" value={nuevoTorneo.descripcion} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label>Archivo PDF con Bases del Torneo</label>
            <input type="file" accept=".pdf" className="form-control mb-2" onChange={handleFileChange} />
            {archivoPDF && <p className="text-muted">Archivo seleccionado: {archivoPDF.name}</p>}
          </div>
          <div className="mb-3">
            <label>Tipo de Torneo</label>
            <select name="tipoTorneoID" className="form-control" value={nuevoTorneo.tipoTorneoID} onChange={handleChange} required>
              <option value="">Seleccione un tipo</option>
              {tiposTorneo.map((tipo: TipoTorneo) => ( // Añade TipoTorneo a la interfaz si no está en hook
                <option key={tipo.tipoTorneoId} value={tipo.tipoTorneoId}>{tipo.nombreTipoTorneo}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Tipo de Juego</label>
            <select name="tipoJuegoID" className="form-control" value={nuevoTorneo.tipoJuegoID} onChange={handleChange} required>
              <option value="">Seleccione un tipo de juego</option>
              {tiposJuego.map(j => (
                <option key={j.tipoJuegoId} value={j.tipoJuegoId}>{j.nombre}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Cantidad de Participantes por rama</label>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={nuevoTorneo.ramas.includes('masculina')} onChange={() => handleCheckbox('masculina')} id="ramaMasculina" />
              <label className="form-check-label" htmlFor="ramaMasculina">Masculina</label>
              {nuevoTorneo.ramas.includes('masculina') && (
                tipoTorneoRestringido() ? (
                  <select
                    className="form-control mt-2"
                    value={nuevoTorneo.participantesPorRama.masculina}
                    onChange={(e) => setNuevoTorneo(prev => ({
                      ...prev,
                      participantesPorRama: {
                        ...prev.participantesPorRama,
                        masculina: e.target.value
                      }
                    }))}
                    required
                  >
                    <option value="">Seleccione cantidad</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                    <option value="16">16</option>
                    <option value="32">32</option>
                    <option value="64">64</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ej. 10, 20 o indefinido"
                    className="form-control mt-2"
                    value={nuevoTorneo.participantesPorRama.masculina}
                    onChange={(e) => setNuevoTorneo(prev => ({
                      ...prev,
                      participantesPorRama: {
                        ...prev.participantesPorRama,
                        masculina: e.target.value
                      }
                    }))}
                    required
                  />
                )
              )}
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={nuevoTorneo.ramas.includes('femenina')} onChange={() => handleCheckbox('femenina')} id="ramaFemenina" />
              <label className="form-check-label" htmlFor="ramaFemenina">Femenina</label>
              {nuevoTorneo.ramas.includes('femenina') && (
                tipoTorneoRestringido() ? (
                  <select
                    className="form-control mt-2"
                    value={nuevoTorneo.participantesPorRama.femenina}
                    onChange={(e) => setNuevoTorneo(prev => ({
                      ...prev,
                      participantesPorRama: {
                        ...prev.participantesPorRama,
                        femenina: e.target.value
                      }
                    }))}
                    required
                  >
                    <option value="">Seleccione cantidad</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                    <option value="16">16</option>
                    <option value="32">32</option>
                    <option value="64">64</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ej. 10, 20 o indefinido"
                    className="form-control mt-2"
                    value={nuevoTorneo.participantesPorRama.femenina}
                    onChange={(e) => setNuevoTorneo(prev => ({
                      ...prev,
                      participantesPorRama: {
                        ...prev.participantesPorRama,
                        femenina: e.target.value
                      }
                    }))}
                    required
                  />
                )
              )}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={subiendo}>
            {subiendo ? 'Validando...' : '➡️ Continuar'}
          </button>
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
                    <td><button className="btn btn-warning btn-sm" onClick={() => navigate(`/admin/torneos/editar-torneo/${t.torneoId}`)}>✏️ Editar</button></td>
                    <td>{t.nombre}</td>
                    <td>{t.nameTipoTorneo}</td>
                    <td>{t.nameTipoJuego}</td>
                    <td>{formatoFecha(t.fechaInicio)}</td>
                    <td>{formatoFecha(t.fechaFin)}</td>
                    <td>{formatoFecha(t.fechaInicioInscripcion)}</td>
                    <td>{formatoFecha(t.fechaFinInscripcion)}</td>
                    <td>{t.creadoPor}</td>
                    <td>{t.estado}</td>
                    <td><button className="btn btn-sm btn-outline-success" onClick={() => toggleExpand(t.torneoId)}>{expanded === t.torneoId ? "Ocultar" : "Ver"}</button></td>
                  </tr>
                  {expanded === t.torneoId && (
                    <tr>
                      <td colSpan={11}>
                        <div className="p-3 bg-light rounded">
                          <p><strong>📖 Descripción:</strong> {t.descripcion || '—'}</p>
                          <p><strong>📚 Bases:</strong> {t.basesTorneo ? (<a href={`${t.basesTorneo}?v=${new Date().getTime()}`} target="_blank" rel="noopener noreferrer">Ver documento</a>) : '—'}</p>

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

      {/* --- MODAL DE RESUMEN --- */}
      <Modal show={showSummaryModal} onHide={() => setShowSummaryModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>📋 Resumen del Torneo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <p><strong>Nombre:</strong> {nuevoTorneo.nombre}</p>
              {/* --- USAR LOS NOMBRES GUARDADOS EN EL ESTADO DE RESUMEN --- */}
              <p><strong>Tipo de Torneo:</strong> {resumenNombres.tipoTorneoNombre}</p>
              <p><strong>Tipo de Juego:</strong> {resumenNombres.tipoJuegoNombre}</p>
              {/* --- FIN CAMBIO --- */}
              <p><strong>Descripción:</strong> {nuevoTorneo.descripcion || 'No especificada'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Inicio Inscripción:</strong> {formatoFecha(nuevoTorneo.fechaInicioInscripcion)}</p>
              <p><strong>Fin Inscripción:</strong> {formatoFecha(nuevoTorneo.fechaFinInscripcion)}</p>
              <p><strong>Inicio Torneo:</strong> {formatoFecha(nuevoTorneo.fechaInicio)}</p>
              <p><strong>Fin Torneo:</strong> {formatoFecha(nuevoTorneo.fechaFin)}</p>
              <p><strong>Archivo Bases:</strong> {archivoPDF ? archivoPDF.name : 'No seleccionado'}</p>
            </div>
          </div>
          <hr />
          <h6>Ramas y Participantes:</h6>
          {nuevoTorneo.ramas.length > 0 ? (
            <ul>
              {nuevoTorneo.ramas.map(rama => (
                <li key={rama}>
                  <strong>{rama.charAt(0).toUpperCase() + rama.slice(1)}:</strong> {nuevoTorneo.participantesPorRama[rama as 'masculina' | 'femenina']} equipos
                </li>
              ))}
            </ul>
          ) : (
            <p>No se han seleccionado ramas.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSummaryModal(false)}>
            Volver a Editar
          </Button>
          <Button variant="primary" onClick={handleGuardarTorneo} disabled={subiendo}>
            {subiendo ? 'Creando Torneo...' : '✅ Confirmar y Crear Torneo'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Torneos;