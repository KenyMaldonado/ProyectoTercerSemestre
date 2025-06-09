import { useState, useEffect, useCallback } from 'react';
import { getJugadoresPaginados, getTorneos, getSubtorneos, getEquipos, getJugadoresPorEquipo, searchPlayers } from '../../../services/api'; 
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';

// ... (Definiciones de interfaz Asignacion, Jugador, ResponseJugadores, EquipoNombre sin cambios) ...
export interface Asignacion {
    posicionId: number;
    posicionName: string;
    dorsal: number;
    equipoId: number;
    jugadorId: number;
    estado: boolean;
    facultadID: number;
}

export interface Jugador {
    nombre: string;
    apellido: string;
    jugadorId: number;
    carne: number;
    fotografia: string | null;
    municipioId: number;
    municipioName: string;
    departamentoId: number;
    departamentoName: string;
    carreraId: number;
    carreraName: string;
    carreraSemestreId: number;
    semestre: number;
    seccion: string;
    codigoCarrera: string;
    fechaNacimiento: string;
    edad: number;
    telefono: string;
    estado: number;
    estadoTexto: string | null;
    asignacion: Asignacion | null;
}

export interface ResponseJugadores {
    items: Jugador[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalItems: number;
}

interface EquipoNombre {
    equipoId: number;
    nombre: string;
}

const JugadorList = () => {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [torneos, setTorneos] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subtorneos, setSubtorneos] = useState<any[]>([]);
    const [equiposNombres, setEquiposNombres] = useState<EquipoNombre[]>([]);
    const [selectedTorneoId, setSelectedTorneoId] = useState<number | null>(null);
    const [selectedSubtorneoId, setSelectedSubtorneoId] = useState<number | null>(null);
    const [selectedEquipoId, setSelectedEquipoId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingEquiposNombres, setLoadingEquiposNombres] = useState<boolean>(false);

    const navigate = useNavigate();

    const fetchInitialJugadores = useCallback(async () => {
        try {
            const data: ResponseJugadores = await getJugadoresPaginados(page);
            setJugadores(data.items || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error al obtener jugadores iniciales:', error);
            setJugadores([]);
            setTotalPages(0);
        }
    }, [page]);

    useEffect(() => {
        const fetchTorneos = async () => {
            try {
                const data = await getTorneos();
                setTorneos(data);
            } catch (error) { console.error('Error fetching torneos:', error); setTorneos([]); }
        };
        fetchTorneos();
    }, []);

    useEffect(() => {
        const fetchSubtorneos = async () => {
            if (selectedTorneoId !== null && !isNaN(selectedTorneoId)) {
                try {
                    const data = await getSubtorneos(selectedTorneoId);
                    setSubtorneos(data);
                    if (data.length === 0) { 
                        setEquiposNombres([]);
                        setSelectedEquipoId(null);
                    }
                } catch (error) { console.error('Error fetching subtorneos:', error); setSubtorneos([]); }
            } else {
                setSubtorneos([]);
                setEquiposNombres([]);
                setSelectedEquipoId(null);
            }
        };
        fetchSubtorneos();
    }, [selectedTorneoId]);

    useEffect(() => {
        const loadAllEquiposNombres = async () => {
            if (selectedSubtorneoId !== null && !isNaN(selectedSubtorneoId)) {
                setEquiposNombres([]); 
                setSelectedEquipoId(null); 
                setLoadingEquiposNombres(true);
                let allEquipos: EquipoNombre[] = [];
                let currentPage = 1;
                let fetchedTotalPages = 1;
                try {
                    do {
                        const data = await getEquipos(selectedSubtorneoId, currentPage);
                        if (data && data.items) {
                            allEquipos = allEquipos.concat(data.items.map((e: { equipoId: number; nombre: string }) => ({ equipoId: e.equipoId, nombre: e.nombre })));
                            fetchedTotalPages = data.totalPages || 1;
                        } else {
                            fetchedTotalPages = 0; break;
                        }
                        currentPage++;
                    } while (currentPage <= fetchedTotalPages);
                    
                    setEquiposNombres(allEquipos);

                    if (allEquipos.length === 0) {
                        setJugadores([]); 
                        setTotalPages(0); 
                    }
                } catch (error) {
                    console.error('Error fetching equipos para el combo:', error);
                    setEquiposNombres([]);
                    setJugadores([]); 
                    setTotalPages(0);
                } finally {
                    setLoadingEquiposNombres(false);
                }
            } else {
                setEquiposNombres([]);
                setSelectedEquipoId(null);
            }
        };
        loadAllEquiposNombres();
    }, [selectedSubtorneoId]);

    useEffect(() => {
        const fetchJugadoresPorEquipoFn = async (teamId: number) => {
            setLoading(true);
            try {
                const response = await getJugadoresPorEquipo(teamId);
                // getJugadoresPorEquipo también parece devolver un objeto con 'data'
                setJugadores(response.data || []); 
                setTotalPages(1); 
            } catch (error) { console.error('Error al obtener jugadores por equipo:', error); setJugadores([]); setTotalPages(0); }
            finally { setLoading(false); }
        };
        if (selectedEquipoId !== null && !isNaN(selectedEquipoId)) {
            fetchJugadoresPorEquipoFn(selectedEquipoId);
        }
    }, [selectedEquipoId]);

    useEffect(() => {
        if (selectedEquipoId !== null && !isNaN(selectedEquipoId)) {
            return; 
        }

        if (selectedSubtorneoId && !loadingEquiposNombres && equiposNombres.length === 0) {
            setJugadores([]); 
            setTotalPages(0); 
            setLoading(false); 
            return;
        }

        if (selectedTorneoId && subtorneos.length === 0 && !selectedSubtorneoId) {
             setJugadores([]); 
             setTotalPages(0); 
             setLoading(false); 
             return;
        }

        setLoading(true);
        const fetchData = async () => {
            try {
                if (search.trim()) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const dataFromSearch: any = await searchPlayers(search); // Almacenamos la respuesta completa
                    // Accedemos a la propiedad 'data' del objeto de respuesta
                    setJugadores(dataFromSearch.data || []); 
                    setTotalPages(1); 
                } else {
                    await fetchInitialJugadores();
                }
            } catch (error) { 
                console.error('Error al obtener datos paginados o buscar jugadores:', error); 
                setJugadores([]); 
                setTotalPages(0); 
            }
            finally { setLoading(false); }
        };
        fetchData();
    }, [page, search, selectedTorneoId, selectedSubtorneoId, selectedEquipoId, fetchInitialJugadores, equiposNombres, loadingEquiposNombres, subtorneos]);

    const handleTorneoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const torneoId = e.target.value === '' ? null : Number(e.target.value);
        setSelectedTorneoId(torneoId);
        setSelectedSubtorneoId(null); 
        setSelectedEquipoId(null);
        setPage(1); 
        setSearch(''); 
    };

    const handleSubtorneoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subtorneoId = e.target.value === '' ? null : Number(e.target.value);
        setSelectedSubtorneoId(subtorneoId);
        setSelectedEquipoId(null); 
        setPage(1); 
        setSearch(''); 
    };

    const handleEquipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const equipoId = e.target.value === '' ? null : Number(e.target.value);
        setSelectedEquipoId(equipoId);
        setPage(1); 
        setSearch(''); 
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); };
    const handleSearchButtonClick = () => { setPage(1); };

    const handlePageChange = (newPage: number) => { 
        if (newPage > 0 && newPage <= totalPages && newPage !== page) { 
            setPage(newPage); 
        } 
    };
    
    const handleResetFilters = () => { 
        setSelectedTorneoId(null); 
        setSelectedSubtorneoId(null); 
        setSelectedEquipoId(null); 
        setSearch(''); 
        setPage(1); 
    };

    const getNoJugadoresMessage = (): string => {
        if (loading) return "Cargando..."; 

        if (selectedEquipoId) {
            const equipoSeleccionado = equiposNombres.find(e => e.equipoId === selectedEquipoId);
            const nombreEquipo = equipoSeleccionado ? `"${equipoSeleccionado.nombre}"` : "seleccionado";
            return search.trim()
                ? `No se encontraron jugadores en el equipo ${nombreEquipo} que coincidan con "${search}".`
                : `El equipo ${nombreEquipo} no tiene jugadores registrados.`;
        }

        if (selectedSubtorneoId) {
            if (!loadingEquiposNombres && equiposNombres.length === 0) {
                return "Este subtorneo no tiene equipos disponibles. Por favor, selecciona otro subtorneo.";
            }
            return "Por favor, selecciona un equipo para ver sus jugadores.";
        }

        if (selectedTorneoId) {
            if (subtorneos.length === 0) { 
                return "Este torneo no tiene subtorneos disponibles. Por favor, selecciona otro torneo.";
            }
            return "Por favor, selecciona un subtorneo para continuar.";
        }
        
        if (search.trim()) {
            return `No se encontraron jugadores que coincidan con "${search}".`;
        }

        return "Aún no hay jugadores para mostrar. Selecciona filtros o realiza una búsqueda para comenzar.";
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Lista de Jugadores</h2>
            <div className="row mb-3 gx-2">
                <div className="col-md-3">
                    <input type="text" placeholder="Buscar por nombre o carné..." value={search} onChange={handleSearchChange} className="form-control"/>
                </div>
                <div className="col-md-2">
                    <Form.Select onChange={handleTorneoChange} value={selectedTorneoId || ''} aria-label="Seleccionar Torneo">
                        <option value="">Torneo</option>
                        {torneos.map((torneo) => (<option key={torneo.torneoId} value={torneo.torneoId}>{torneo.nombre}</option>))}
                    </Form.Select>
                </div>
                <div className="col-md-2">
                    <Form.Select onChange={handleSubtorneoChange} disabled={!selectedTorneoId} value={selectedSubtorneoId || ''} aria-label="Seleccionar Subtorneo">
                        <option value="">Subtorneo</option>
                        {selectedTorneoId && subtorneos.length === 0 ? 
                            (<option disabled>Este torneo no tiene subtorneos</option>) : 
                            (subtorneos.map((subtorneo) => (<option key={subtorneo.subTorneoId} value={subtorneo.subTorneoId}>{subtorneo.categoria}</option>)))
                        }
                    </Form.Select>
                </div>
                <div className="col-md-2">
                    <Form.Select onChange={handleEquipoChange} disabled={!selectedSubtorneoId || loadingEquiposNombres} value={selectedEquipoId || ''} aria-label="Seleccionar Equipo">
                        <option value="">Equipo</option>
                        {selectedSubtorneoId && equiposNombres.length === 0 && !loadingEquiposNombres ? 
                            (<option disabled>Este subtorneo no tiene equipos</option>) : 
                            (equiposNombres.map((equipo) => (<option key={equipo.equipoId} value={equipo.equipoId}>{equipo.nombre}</option>)))
                        }
                    </Form.Select>
                    {loadingEquiposNombres && <p className="mt-1 text-muted small">Cargando equipos...</p>}
                </div>
                <div className="col-md-auto"><button onClick={handleSearchButtonClick} className="btn btn-primary w-100">Buscar</button></div>
                <div className="col-md-auto"><button onClick={handleResetFilters} className="btn btn-outline-secondary w-100">Limpiar</button></div>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando jugadores...</p>
                </div>
            ) : (
                <>
                    <div className="row">
                        {jugadores.length > 0 ? (
                            jugadores.map((jugador) => (
                                <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={jugador.jugadorId}>
                                    <div className="card h-100 shadow-sm">
                                        <img
                                            src={jugador.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'}
                                            className="card-img-top"
                                            alt={`${jugador.nombre} ${jugador.apellido}`}
                                            style={{ objectFit: 'cover', height: '280px' }}
                                        />
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title h6">{jugador.nombre} {jugador.apellido}</h5>
                                            {jugador.asignacion && (
                                                <div className="small text-muted mb-2">
                                                    <p className="mb-0">Carné: {jugador.carne}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => navigate(`/admin/jugadores/${jugador.jugadorId}`, { state: { jugador } })}
                                                className="btn btn-sm btn-success mt-auto"
                                            >
                                                Ver Detalles
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center my-5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-search text-muted mb-3" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                                </svg>
                                <p className="lead text-muted">{getNoJugadoresMessage()}</p>
                            </div>
                        )}
                    </div>

                    {(!search.trim() && !selectedEquipoId && totalPages > 1 && jugadores.length > 0) && (
                        <div className="d-flex justify-content-center mt-4">
                            <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="btn btn-secondary mx-2">Anterior</button>
                            <span className="align-self-center">Página {page} de {totalPages}</span>
                            <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="btn btn-secondary mx-2">Siguiente</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JugadorList;