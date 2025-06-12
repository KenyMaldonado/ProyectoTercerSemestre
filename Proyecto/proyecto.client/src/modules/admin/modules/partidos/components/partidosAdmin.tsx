import { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  getTorneos,
  getSubtorneos,
  getPartidosPorJornada,
  registrarResultados,
  getJugadoresPorEquipo,
  updateArbitroPartido,
  getArbitros, // <-- Importado getArbitros
} from '../../../services/api';

// --- Tipos de Datos ---

interface Torneo { torneoId: number; nombre: string; }
interface SubTorneo { subTorneoId: number; categoria: string; }
interface EquipoResumen {
  equipoId: number;
  nombre: string;
  nameFacultad: string;
  imagenEquipo: string;
}
interface PartidoResumen {
  partidoId: number;
  fechaPartido: string;
  horaPartido: string;
  equipo1: EquipoResumen;
  equipo2: EquipoResumen;
  estado: string; // 'Pendiente', 'Jugado', 'Finalizado', etc.
  jornada: number;
  faseId: number;
  nameArbitro: string;
  nameCancha: string;
}
interface JornadaPartidos {
  numeroJornada: number;
  partidos: PartidoResumen[];
}

type GolTipo = 1 | 2 | 3; // 1=jugada, 2=tiempo extra, 3=penal
type TarjetaTipo = 'Amarilla' | 'Roja';

// Interfaz para Goles en el FRONTEND (incluye equipoId para lógica local)
interface Gol {
  minutoGol: number;
  ordenPenal: number;
  resultadoPartidoId: number;
  jugadorId: number;
  tipoGolId: GolTipo;
  equipoId: number; // Necesario para la lógica de visualización en el modal
}

// Interfaz para Tarjetas en el FRONTEND (incluye equipoId para lógica local)
interface Tarjeta {
  minutoTarjeta: number;
  descripcion: string;
  estado: string;
  tipoTarjeta: TarjetaTipo;
  resultadoPartidoId: number;
  jugadorId: number;
  equipoId: number; // Necesario para la lógica de visualización en el modal
}

// --- Nuevas Interfaces para el Payload de la API (SIN equipoId) ---
interface GolApi {
  minutoGol: number;
  ordenPenal: number;
  resultadoPartidoId: number;
  jugadorId: number;
  tipoGolId: number;
}

interface TarjetaApi {
  minutoTarjeta: number;
  descripcion: string;
  estado: string;
  tipoTarjeta: string;
  resultadoPartidoId: number;
  jugadorId: number;
}

// Interfaz del payload que se envía a la API (coincide con tu api.ts)
export interface RegistrarResultadosPayload {
  partidoID: number;
  golesPartido: GolApi[];
  tarjetasPartido: TarjetaApi[];
}

// Interfaz para jugadores
interface Jugador {
  jugadorId: number;
  nombre: string;
  apellido: string;
}

// Interfaz para el árbitro (ACTUALIZADA con usuarioId)
interface Arbitro {
  usuarioId: number; // <-- Cambiado a usuarioId
  nombre: string;
  apellido: string;
}

// Interfaz para la respuesta de la API (generalizada para éxito/error)
interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any; // Para cuando hay data, aunque no la usemos aquí directamente para errores
}

// --- Componente principal ---
export default function PartidosPorSubtorneo() {
  // Estados para selects y filtros
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [selectedTorneo, setSelectedTorneo] = useState<number | null>(null);

  const [subtorneos, setSubtorneos] = useState<SubTorneo[]>([]);
  const [selectedSubtorneo, setSelectedSubtorneo] = useState<number | null>(null);

  const [jornadas, setJornadas] = useState<JornadaPartidos[]>([]);
  const [selectedJornada, setSelectedJornada] = useState<number | 'todos' | null>('todos');

  const [filtroEquipo, setFiltroEquipo] = useState('');

  // Control del modal de resultados
  const [modalVisible, setModalVisible] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<PartidoResumen | null>(null);

  // Datos de goles y tarjetas en el modal (usan las interfaces locales Gol y Tarjeta)
  const [goles, setGoles] = useState<Gol[]>([]);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);

  // Estados para los jugadores de cada equipo en el modal
  const [jugadoresEquipo1, setJugadoresEquipo1] = useState<Jugador[]>([]);
  const [jugadoresEquipo2, setJugadoresEquipo2] = useState<Jugador[]>([]);

  // Estado para los árbitros
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);


  // --- Carga inicial ---
  useEffect(() => {
    getTorneos().then(data => {
      setTorneos(data);
      if (data.length > 0) setSelectedTorneo(data[0].torneoId);
    });
    // Cargar árbitros al inicio
    getArbitros().then(data => setArbitros(data || []));
  }, []);

  // Cargar subtorneos cuando cambia torneo
  useEffect(() => {
    if (selectedTorneo !== null) {
      getSubtorneos(selectedTorneo).then(data => {
        setSubtorneos(data);
        if (data.length > 0) setSelectedSubtorneo(data[0].subTorneoId);
        else {
          setSelectedSubtorneo(null);
          setJornadas([]);
          setSelectedJornada('todos');
        }
      });
    }
  }, [selectedTorneo]);

  // Cargar jornadas y partidos cuando cambia subtorneo
  useEffect(() => {
    if (selectedSubtorneo !== null) {
      getPartidosPorJornada(selectedSubtorneo).then(data => {
        setJornadas(data);
        setSelectedJornada('todos');
      });
    }
  }, [selectedSubtorneo]);

  // Filtrar partidos según jornada y filtro equipo
  const partidosFiltrados = useMemo(() => {
    if (!jornadas || jornadas.length === 0) return [];

    let partidos: PartidoResumen[] = [];
    if (selectedJornada === 'todos') {
      jornadas.forEach(j => partidos.push(...j.partidos));
    } else {
      const j = jornadas.find(j => j.numeroJornada === selectedJornada);
      partidos = j ? j.partidos : [];
    }

    if (filtroEquipo.trim() === '') return partidos;

    return partidos.filter(
      p =>
        p.equipo1.nombre.toLowerCase().includes(filtroEquipo.toLowerCase()) ||
        p.equipo2.nombre.toLowerCase().includes(filtroEquipo.toLowerCase())
    );
  }, [jornadas, selectedJornada, filtroEquipo]);

  // --- Funciones modal de resultados ---

  async function abrirModalResultados(partido: PartidoResumen) {
    // Verificar si el partido ya está finalizado ANTES de abrir el modal
    if (partido.estado === 'Jugado' || partido.estado === 'Finalizado') {
      Swal.fire({
        title: 'Partido Finalizado',
        text: 'No se pueden ingresar resultados para un partido que ya ha sido finalizado.',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setPartidoSeleccionado(partido);
    setGoles([]);
    setTarjetas([]);

    try {
      const jugadores1 = await getJugadoresPorEquipo(partido.equipo1.equipoId);
      const jugadores2 = await getJugadoresPorEquipo(partido.equipo2.equipoId);
      setJugadoresEquipo1(jugadores1.data || []);
      setJugadoresEquipo2(jugadores2.data || []);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      Swal.fire('Error', 'No se pudieron cargar los jugadores. Intente de nuevo.', 'error');
      setJugadoresEquipo1([]);
      setJugadoresEquipo2([]);
      setModalVisible(false);
      return;
    }

    setModalVisible(true);
  }

  function cerrarModal() {
    setModalVisible(false);
    setPartidoSeleccionado(null);
    setJugadoresEquipo1([]);
    setJugadoresEquipo2([]);
  }

  function agregarGol(equipoId: number) {
    if (!partidoSeleccionado) return;
    setGoles(prev => [
      ...prev,
      {
        minutoGol: 0,
        ordenPenal: 0,
        resultadoPartidoId: partidoSeleccionado.partidoId,
        jugadorId: 0,
        tipoGolId: 1,
        equipoId: equipoId,
      },
    ]);
  }

  function eliminarGol(index: number) {
    setGoles(prev => prev.filter((_, i) => i !== index));
  }

  function actualizarGol(index: number, campo: keyof Gol, valor: any) {
    setGoles(prev => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  }

  function agregarTarjeta(equipoId: number) {
    if (!partidoSeleccionado) return;
    setTarjetas(prev => [
      ...prev,
      {
        minutoTarjeta: 0,
        descripcion: '',
        estado: 'Activo',
        tipoTarjeta: 'Amarilla',
        resultadoPartidoId: partidoSeleccionado.partidoId,
        jugadorId: 0,
        equipoId: equipoId,
      },
    ]);
  }

  function eliminarTarjeta(index: number) {
    setTarjetas(prev => prev.filter((_, i) => i !== index));
  }

  function actualizarTarjeta(index: number, campo: keyof Tarjeta, valor: any) {
    setTarjetas(prev => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  }

  async function confirmarEnviar() {
    if (!partidoSeleccionado) {
      Swal.fire('Error', 'No hay un partido seleccionado para registrar resultados.', 'error');
      return;
    }

    // Doble verificación: si el partido ya está finalizado, no permitir el envío
    if (partidoSeleccionado.estado === 'Jugado' || partidoSeleccionado.estado === 'Finalizado') {
        Swal.fire('Advertencia', 'Este partido ya está finalizado. No se pueden registrar más resultados.', 'warning');
        return;
    }

    let resumenHtml = `
      <p><strong>Partido:</strong> ${partidoSeleccionado.equipo1.nombre} vs ${partidoSeleccionado.equipo2.nombre}</p>
      <p><strong>ID de Partido:</strong> ${partidoSeleccionado.partidoId}</p>
      <hr/>
      <h5>Goles:</h5>
      ${goles.length === 0 ? '<p>No se registrarán goles.</p>' : ''}
      <ul style="list-style-type: none; padding-left: 0;">
    `;

    goles.forEach(gol => {
      const equipoNombre = gol.equipoId === partidoSeleccionado.equipo1.equipoId
        ? partidoSeleccionado.equipo1.nombre
        : partidoSeleccionado.equipo2.nombre;
      const jugador = [...jugadoresEquipo1, ...jugadoresEquipo2].find(j => j.jugadorId === gol.jugadorId);
      const nombreJugador = jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Desconocido (ID: ' + gol.jugadorId + ')';
      const tipoGol = gol.tipoGolId === 1 ? 'Jugada' : gol.tipoGolId === 2 ? 'Tiempo Extra' : 'Penal';
      resumenHtml += `<li><strong>${equipoNombre}</strong> - Minuto ${gol.minutoGol}: ${nombreJugador} (${tipoGol})</li>`;
    });
    resumenHtml += `</ul>
      <hr/>
      <h5>Tarjetas:</h5>
      ${tarjetas.length === 0 ? '<p>No se registrarán tarjetas.</p>' : ''}
      <ul style="list-style-type: none; padding-left: 0;">
    `;

    tarjetas.forEach(tarjeta => {
      const equipoNombre = tarjeta.equipoId === partidoSeleccionado.equipo1.equipoId
        ? partidoSeleccionado.equipo1.nombre
        : partidoSeleccionado.equipo2.nombre;
      const jugador = [...jugadoresEquipo1, ...jugadoresEquipo2].find(j => j.jugadorId === tarjeta.jugadorId);
      const nombreJugador = jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Desconocido (ID: ' + tarjeta.jugadorId + ')';
      resumenHtml += `<li><strong>${equipoNombre}</strong> - Minuto ${tarjeta.minutoTarjeta}: ${nombreJugador} - ${tarjeta.tipoTarjeta} (${tarjeta.descripcion || 'Sin descripción'})</li>`;
    });
    resumenHtml += `</ul>`;


    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar registro de resultados?',
      html: resumenHtml,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'No, revisar'
    });

    if (!isConfirmed) {
      return;
    }

    // Mapeamos los goles y tarjetas a las interfaces que espera la API (sin equipoId)
    const golesParaApi: GolApi[] = goles.map(g => ({
        minutoGol: g.minutoGol,
        ordenPenal: g.ordenPenal,
        resultadoPartidoId: g.resultadoPartidoId,
        jugadorId: g.jugadorId,
        tipoGolId: g.tipoGolId,
    }));

    const tarjetasParaApi: TarjetaApi[] = tarjetas.map(t => ({
        minutoTarjeta: t.minutoTarjeta,
        descripcion: t.descripcion,
        estado: t.estado,
        tipoTarjeta: t.tipoTarjeta,
        resultadoPartidoId: t.resultadoPartidoId,
        jugadorId: t.jugadorId,
    }));

    const payload: RegistrarResultadosPayload = {
      partidoID: partidoSeleccionado.partidoId,
      golesPartido: golesParaApi,
      tarjetasPartido: tarjetasParaApi,
    };

    try {
      const exito = await registrarResultados(payload);
      if (exito) {
        Swal.fire(
          '¡Registrado!',
          'Los resultados han sido registrados con éxito.',
          'success'
        );
        cerrarModal();
        // Recargar los partidos para que el estado se actualice en la tabla
        if (selectedSubtorneo !== null) {
          getPartidosPorJornada(selectedSubtorneo).then(data => {
            setJornadas(data);
          });
        }
      } else {
        Swal.fire(
          'Error',
          'Hubo un problema al registrar los resultados.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al enviar resultados:', error);
      Swal.fire(
        'Error',
        'Ocurrió un error inesperado al registrar los resultados.',
        'error'
      );
    }
  }

  async function abrirModalAsignarArbitro(partido: PartidoResumen) {
    // Verificar si el partido ya está finalizado ANTES de abrir el modal
    if (partido.estado === 'Jugado' || partido.estado === 'Finalizado') {
      Swal.fire({
        title: 'Partido Finalizado',
        text: 'No se puede asignar un árbitro a un partido que ya ha sido finalizado.',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (arbitros.length === 0) {
        Swal.fire({
            title: 'No hay árbitros disponibles',
            text: 'No se encontraron árbitros para asignar. Asegúrese de que hay árbitros registrados.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    // Crear las opciones para el select de SweetAlert2
    // FIX: Define explícitamente el tipo de inputOptions para que acepte claves numéricas
    const inputOptions: { [key: number]: string } = {};
    arbitros.forEach(arb => {
      inputOptions[arb.usuarioId] = `${arb.nombre} ${arb.apellido}`; // Usamos usuarioId
    });

    const { value: arbitroId } = await Swal.fire({
      title: 'Seleccionar Árbitro',
      input: 'select',
      inputOptions: inputOptions,
      inputPlaceholder: 'Seleccione un árbitro',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Asignar',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            resolve('');
          } else {
            resolve('Debe seleccionar un árbitro');
          }
        });
      },
    });

    if (arbitroId) {
      // Si se seleccionó un árbitro, llama a la función de la API
      const input = {
        arbitroId: Number(arbitroId), // Aquí va arbitroId, que es el usuarioId del árbitro
        partidoId: partido.partidoId,
      };

      try {
        // La función updateArbitroPartido debería manejar el 204 y el JSON con success/message
        // Por la estructura de tu api.ts, puede devolver un boolean o un objeto.
        const result: ApiResponse | boolean = await updateArbitroPartido(input);

        // Si `updateArbitroPartido` retorna `true` para 204, o un objeto `{ success: true }`
        if (typeof result === 'boolean' && result) {
            Swal.fire('¡Éxito!', 'Árbitro asignado correctamente.', 'success');
        } else if (typeof result === 'object' && result.success) {
            Swal.fire('¡Éxito!', 'Árbitro asignado correctamente.', 'success');
        }
        // Si `updateArbitroPartido` retorna un objeto `{ success: false, message: "..." }`
        else if (typeof result === 'object' && !result.success && result.message) {
            Swal.fire('Error', result.message, 'error');
        }
        // Para cualquier otro caso que updateArbitroPartido devuelva `false`
        else {
            Swal.fire('Error', 'No se pudo asignar el árbitro. Intente de nuevo.', 'error');
        }

        // Recargar los partidos para que la tabla muestre el árbitro actualizado
        if (selectedSubtorneo !== null) {
          getPartidosPorJornada(selectedSubtorneo).then(data => {
            setJornadas(data);
          });
        }
      } catch (error: any) {
        // Esto captura errores de red o errores lanzados explícitamente desde updateArbitroPartido
        console.error('Error al asignar árbitro:', error);
        let errorMessage = 'Ocurrió un error inesperado al asignar el árbitro.';

        // Intentar obtener el mensaje de error si está disponible
        if (error.message) {
            try {
                // Si el error.message es un JSON string, intenta parsearlo
                const errorObj = JSON.parse(error.message);
                if (errorObj && errorObj.message) {
                    errorMessage = errorObj.message;
                } else {
                    errorMessage = error.message;
                }
            } catch {
                // No es un JSON string, usa el mensaje tal cual
                errorMessage = error.message;
            }
        }
        Swal.fire('Error', errorMessage, 'error');
      }
    }
  }


  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gestión de Partidos</h2>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Filtros de Partidos</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="selectTorneo" className="form-label fw-bold">Torneo:</label>
              <select
                id="selectTorneo"
                className="form-select"
                value={selectedTorneo ?? ''}
                onChange={e => setSelectedTorneo(Number(e.target.value))}
              >
                {torneos.map(t => (
                  <option key={t.torneoId} value={t.torneoId}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="selectSubtorneo" className="form-label fw-bold">Subtorneo:</label>
              <select
                id="selectSubtorneo"
                className="form-select"
                value={selectedSubtorneo ?? ''}
                onChange={e => setSelectedSubtorneo(Number(e.target.value))}
                disabled={!selectedTorneo || subtorneos.length === 0}
              >
                {subtorneos.length === 0 ? (
                  <option value="">No hay subtorneos disponibles</option>
                ) : (
                  subtorneos.map(st => (
                    <option key={st.subTorneoId} value={st.subTorneoId}>
                      {st.categoria}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="selectJornada" className="form-label fw-bold">Jornada:</label>
              <select
                id="selectJornada"
                className="form-select"
                value={selectedJornada ?? 'todos'}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedJornada(val === 'todos' ? 'todos' : Number(val));
                }}
                disabled={!selectedSubtorneo || jornadas.length === 0}
              >
                <option value="todos">Todas</option>
                {jornadas.map(j => (
                  <option key={j.numeroJornada} value={j.numeroJornada}>
                    Jornada {j.numeroJornada}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label htmlFor="filtroEquipo" className="form-label fw-bold">Filtrar por equipo:</label>
              <input
                id="filtroEquipo"
                type="text"
                className="form-control"
                placeholder="Nombre de equipo"
                value={filtroEquipo}
                onChange={e => setFiltroEquipo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <h3 className="mb-3">Partidos Programados</h3>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Equipo 1</th>
              <th>Equipo 2</th>
              <th>Jornada</th>
              <th>Estado</th>
              <th>Árbitro</th>
              <th>Cancha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {partidosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  <div className="alert alert-info" role="alert">
                    No se encontraron partidos para la selección actual.
                  </div>
                </td>
              </tr>
            ) : (
              partidosFiltrados.map(p => {
                const fecha = new Date(p.fechaPartido);
                const fechaFormateada = fecha.toLocaleDateString('es-GT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });

                const [horas, minutos] = p.horaPartido.split(':');
                const horaFormateada = `${horas}:${minutos}`;

                // Determinar si el partido está finalizado (para deshabilitar botones)
                const isMatchFinalized = p.estado === 'Jugado' || p.estado === 'Finalizado';

                return (
                  <tr key={p.partidoId}>
                    <td>{fechaFormateada}</td>
                    <td>{horaFormateada}</td>
                    <td>
                      <img src={p.equipo1.imagenEquipo || '[https://via.placeholder.com/30](https://via.placeholder.com/30)'} alt={p.equipo1.nombre} className="img-fluid me-2" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '50%' }} />
                      {p.equipo1.nombre}
                    </td>
                    <td>
                      <img src={p.equipo2.imagenEquipo || '[https://via.placeholder.com/30](https://via.placeholder.com/30)'} alt={p.equipo2.nombre} className="img-fluid me-2" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '50%' }} />
                      {p.equipo2.nombre}
                    </td>
                    <td>{p.jornada}</td>
                    <td><span className={`badge ${p.estado === 'Pendiente' ? 'bg-warning text-dark' : p.estado === 'Jugado' ? 'bg-success' : 'bg-info'}`}>{p.estado}</span></td>
                    <td>{p.nameArbitro || 'Sin asignar'}</td>
                    <td>{p.nameCancha || 'N/A'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => abrirModalResultados(p)}
                          disabled={isMatchFinalized}
                          title={isMatchFinalized ? 'Este partido ya ha sido finalizado. No se pueden registrar más resultados.' : 'Registrar resultados'}
                        >
                          <i className="bi bi-pencil-square me-1"></i>
                          Resultados
                        </button>
                        <button
                          className="btn btn-info btn-sm text-white"
                          onClick={() => abrirModalAsignarArbitro(p)}
                          disabled={isMatchFinalized}
                          title={isMatchFinalized ? 'Este partido ya ha sido finalizado. No se puede asignar árbitro.' : 'Asignar árbitro'}
                        >
                          <i className="bi bi-person-fill-add me-1"></i>
                          Asignar Árbitro
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>


      {/* Modal para Registrar Resultados */}
      {modalVisible && partidoSeleccionado && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={cerrarModal}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            role="document"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  Registrar Resultados: <br />
                  <span className="fw-bold">{partidoSeleccionado.equipo1.nombre}</span> vs <span className="fw-bold">{partidoSeleccionado.equipo2.nombre}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row">
                  {/* Columna para Equipo 1 */}
                  <div className="col-md-6 border-end pe-md-4">
                    <h4 className="text-center mb-4 text-primary">
                      <img src={partidoSeleccionado.equipo1.imagenEquipo || '[https://via.placeholder.com/40](https://via.placeholder.com/40)'} alt={partidoSeleccionado.equipo1.nombre} className="img-fluid me-2" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                      {partidoSeleccionado.equipo1.nombre}
                    </h4>
                    
                    {/* Goles Equipo 1 */}
                    <h5 className="mb-3">Goles <button className="btn btn-outline-success btn-sm ms-2" onClick={() => agregarGol(partidoSeleccionado.equipo1.equipoId)}>
                      <i className="bi bi-plus-circle me-1"></i>
                      Gol
                    </button></h5>
                    {goles.filter(g => g.equipoId === partidoSeleccionado.equipo1.equipoId).length === 0 && (
                        <p className="text-muted">No hay goles registrados para este equipo.</p>
                    )}
                    {goles
                      .filter(g => g.equipoId === partidoSeleccionado.equipo1.equipoId)
                      .map((gol, i) => (
                        <div key={i} className="mb-3 p-3 border rounded bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Gol #{i + 1}</h6>
                            <button className="btn btn-danger btn-sm" onClick={() => eliminarGol(goles.indexOf(gol))}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          <div className="row g-2">
                            <div className="col-md-6">
                              <label className="form-label">Minuto:</label>
                              <input
                                type="number"
                                min={0}
                                className="form-control form-control-sm"
                                placeholder="Minuto"
                                value={gol.minutoGol}
                                onChange={e => actualizarGol(goles.indexOf(gol), 'minutoGol', Number(e.target.value))}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Tipo de Gol:</label>
                              <select
                                className="form-select form-select-sm"
                                value={gol.tipoGolId}
                                onChange={e =>
                                  actualizarGol(goles.indexOf(gol), 'tipoGolId', Number(e.target.value) as GolTipo)
                                }
                              >
                                <option value={1}>Jugada</option>
                                <option value={2}>Tiempo Extra</option>
                                <option value={3}>Penal</option>
                              </select>
                            </div>
                            {gol.tipoGolId === 3 && (
                              <div className="col-md-6">
                                <label className="form-label">Orden Penal:</label>
                                <input
                                  type="number"
                                  min={0}
                                  className="form-control form-control-sm"
                                  placeholder="Orden Penal"
                                  value={gol.ordenPenal}
                                  onChange={e => actualizarGol(goles.indexOf(gol), 'ordenPenal', Number(e.target.value))}
                                />
                              </div>
                            )}
                            <div className="col-md-12">
                              <label className="form-label">Jugador:</label>
                              <select
                                className="form-select form-select-sm"
                                value={gol.jugadorId}
                                onChange={e => actualizarGol(goles.indexOf(gol), 'jugadorId', Number(e.target.value))}
                              >
                                <option value={0}>Seleccione un jugador</option>
                                {jugadoresEquipo1.map(j => (
                                  <option key={j.jugadorId} value={j.jugadorId}>
                                    {j.nombre} {j.apellido}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}

                    <hr className="my-4" />

                    {/* Tarjetas Equipo 1 */}
                    <h5 className="mb-3">Tarjetas <button className="btn btn-outline-warning btn-sm ms-2" onClick={() => agregarTarjeta(partidoSeleccionado.equipo1.equipoId)}>
                      <i className="bi bi-plus-circle me-1"></i>
                      Tarjeta
                    </button></h5>
                    {tarjetas.filter(t => t.equipoId === partidoSeleccionado.equipo1.equipoId).length === 0 && (
                        <p className="text-muted">No hay tarjetas registradas para este equipo.</p>
                    )}
                    {tarjetas
                      .filter(t => t.equipoId === partidoSeleccionado.equipo1.equipoId)
                      .map((tarjeta, i) => (
                        <div key={i} className="mb-3 p-3 border rounded bg-light">
                           <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Tarjeta #{i + 1}</h6>
                            <button className="btn btn-danger btn-sm" onClick={() => eliminarTarjeta(tarjetas.indexOf(tarjeta))}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          <div className="row g-2">
                            <div className="col-md-6">
                              <label className="form-label">Minuto:</label>
                              <input
                                type="number"
                                min={0}
                                className="form-control form-control-sm"
                                placeholder="Minuto"
                                value={tarjeta.minutoTarjeta}
                                onChange={e => actualizarTarjeta(tarjetas.indexOf(tarjeta), 'minutoTarjeta', Number(e.target.value))}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Tipo de Tarjeta:</label>
                              <select
                                className="form-select form-select-sm"
                                value={tarjeta.tipoTarjeta}
                                onChange={e => actualizarTarjeta(tarjetas.indexOf(tarjeta), 'tipoTarjeta', e.target.value as TarjetaTipo)}
                              >
                                <option value="Amarilla">Amarilla</option>
                                <option value="Roja">Roja</option>
                              </select>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label">Descripción:</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Descripción"
                                value={tarjeta.descripcion}
                                onChange={e => actualizarTarjeta(tarjetas.indexOf(tarjeta), 'descripcion', e.target.value)}
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label">Jugador:</label>
                              <select
                                className="form-select form-select-sm"
                                value={tarjeta.jugadorId}
                                onChange={e => actualizarTarjeta(tarjetas.indexOf(tarjeta), 'jugadorId', Number(e.target.value))}
                              >
                                <option value={0}>Seleccione un jugador</option>
                                {jugadoresEquipo1.map(j => (
                                  <option key={j.jugadorId} value={j.jugadorId}>
                                    {j.nombre} {j.apellido}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Columna para Equipo 2 */}
                  <div className="col-md-6 ps-md-4">
                    <h4 className="text-center mb-4 text-danger">
                      <img src={partidoSeleccionado.equipo2.imagenEquipo || '[https://via.placeholder.com/40](https://via.placeholder.com/40)'} alt={partidoSeleccionado.equipo2.nombre} className="img-fluid me-2" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                      {partidoSeleccionado.equipo2.nombre}
                    </h4>

                    {/* Goles Equipo 2 */}
                    <h5 className="mb-3">Goles <button className="btn btn-outline-success btn-sm ms-2" onClick={() => agregarGol(partidoSeleccionado.equipo2.equipoId)}>
                      <i className="bi bi-plus-circle me-1"></i>
                      Gol
                    </button></h5>
                    {goles.filter(g => g.equipoId === partidoSeleccionado.equipo2.equipoId).length === 0 && (
                        <p className="text-muted">No hay goles registrados para este equipo.</p>
                    )}
                    {goles
                      .filter(g => g.equipoId === partidoSeleccionado.equipo2.equipoId)
                      .map((gol, i) => (
                        <div key={i} className="mb-3 p-3 border rounded bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Gol #{i + 1}</h6>
                            <button className="btn btn-danger btn-sm" onClick={() => eliminarGol(goles.indexOf(gol))}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          <div className="row g-2">
                            <div className="col-md-6">
                              <label className="form-label">Minuto:</label>
                              <input
                                type="number"
                                min={0}
                                className="form-control form-control-sm"
                                placeholder="Minuto"
                                value={gol.minutoGol}
                                onChange={e => actualizarGol(goles.indexOf(gol), 'minutoGol', Number(e.target.value))}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Tipo de Gol:</label>
                              <select
                                className="form-select form-select-sm"
                                value={gol.tipoGolId}
                                onChange={e =>
                                  actualizarGol(goles.indexOf(gol), 'tipoGolId', Number(e.target.value) as GolTipo)
                                }
                              >
                                <option value={1}>Jugada</option>
                                <option value={2}>Tiempo Extra</option>
                                <option value={3}>Penal</option>
                              </select>
                            </div>
                            {gol.tipoGolId === 3 && (
                              <div className="col-md-6">
                                <label className="form-label">Orden Penal:</label>
                                <input
                                  type="number"
                                  min={0}
                                  className="form-control form-control-sm"
                                  placeholder="Orden Penal"
                                  value={gol.ordenPenal}
                                  onChange={e => actualizarGol(goles.indexOf(gol), 'ordenPenal', Number(e.target.value))}
                                />
                              </div>
                            )}
                            <div className="col-md-12">
                              <label className="form-label">Jugador:</label>
                              <select
                                className="form-select form-select-sm"
                                value={gol.jugadorId}
                                onChange={e => actualizarGol(goles.indexOf(gol), 'jugadorId', Number(e.target.value))}
                              >
                                <option value={0}>Seleccione un jugador</option>
                                {jugadoresEquipo2.map(j => (
                                  <option key={j.jugadorId} value={j.jugadorId}>
                                    {j.nombre} {j.apellido}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    <hr className="my-4" />

                    {/* Tarjetas Equipo 2 */}
                    <h5 className="mb-3">Tarjetas <button className="btn btn-outline-warning btn-sm ms-2" onClick={() => agregarTarjeta(partidoSeleccionado.equipo2.equipoId)}>
                      <i className="bi bi-plus-circle me-1"></i>
                      Tarjeta
                    </button></h5>
                    {tarjetas.filter(t => t.equipoId === partidoSeleccionado.equipo2.equipoId).length === 0 && (
                        <p className="text-muted">No hay tarjetas registradas para este equipo.</p>
                    )}
                    {tarjetas
                      .filter(t => t.equipoId === partidoSeleccionado.equipo2.equipoId)
                      .map((tarjeta, i) => (
                        <div key={i} className="mb-3 p-3 border rounded bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Tarjeta #{i + 1}</h6>
                            <button className="btn btn-danger btn-sm" onClick={() => eliminarTarjeta(tarjetas.indexOf(tarjeta))}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          <div className="row g-2">
                            <div className="col-md-6">
                              <label className="form-label">Minuto:</label>
                              <input
                                type="number"
                                min={0}
                                className="form-control form-control-sm"
                                placeholder="Minuto"
                                value={tarjeta.minutoTarjeta}
                                onChange={e => actualizarTarjeta(tarjetas.indexOf(tarjeta), 'minutoTarjeta', Number(e.target.value))}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Tipo de Tarjeta:</label>
                              <select
                                className="form-select form-select-sm"
                                value={tarjeta.tipoTarjeta}
                                onChange={e => actualizarTarjeta(tarjetas.indexOf(tarjeta), 'tipoTarjeta', e.target.value as TarjetaTipo)}
                              >
                                <option value="Amarilla">Amarilla</option>
                                <option value="Roja">Roja</option>
                              </select>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label">Descripción:</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Descripción"
                                value={tarjeta.descripcion}
                                onChange={e => actualizarTarjeta(tarjetas.indexOf(tarjeta), 'descripcion', e.target.value)}
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label">Jugador:</label>
                              <select
                                className="form-select form-select-sm"
                                value={tarjeta.jugadorId}
                                onChange={e => actualizarTarjeta(tarjetas.indexOf(tarjeta), 'jugadorId', Number(e.target.value))}
                              >
                                <option value={0}>Seleccione un jugador</option>
                                {jugadoresEquipo2.map(j => (
                                  <option key={j.jugadorId} value={j.jugadorId}>
                                    {j.nombre} {j.apellido}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cerrarModal}>
                  <i className="bi bi-x-circle me-1"></i>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={confirmarEnviar}>
                  <i className="bi bi-save me-1"></i>
                  Guardar Resultados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}