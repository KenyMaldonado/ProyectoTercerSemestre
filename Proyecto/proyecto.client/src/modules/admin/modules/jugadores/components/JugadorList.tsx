import { useState, useEffect, useCallback } from 'react';
import { getJugadoresPaginados, getTorneos, getSubtorneos, getEquipos, getJugadoresPorEquipo } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';

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
    const [torneos, setTorneos] = useState<any[]>([]);
    const [subtorneos, setSubtorneos] = useState<any[]>([]);
    const [equiposNombres, setEquiposNombres] = useState<EquipoNombre[]>([]);
    const [selectedTorneoId, setSelectedTorneoId] = useState<number | null>(null);
    const [selectedSubtorneoId, setSelectedSubtorneoId] = useState<number | null>(null);
    const [selectedEquipoId, setSelectedEquipoId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingEquiposNombres, setLoadingEquiposNombres] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchInitialJugadores = useCallback(async () => {
        setLoading(true);
        try {
            const data: ResponseJugadores = await getJugadoresPaginados(page);
            setJugadores(data.items || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error al obtener jugadores:', error);
            setJugadores([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        const fetchTorneos = async () => {
            try {
                const data = await getTorneos();
                setTorneos(data);
                console.log('Torneos cargados:', data);
            } catch (error) {
                console.error('Error fetching torneos:', error);
                setTorneos([]);
            }
        };
        fetchTorneos();
    }, []);

    useEffect(() => {
        const fetchSubtorneos = async () => {
            if (selectedTorneoId !== null && !isNaN(selectedTorneoId)) {
                console.log('Fetching subtorneos for TournamentID:', selectedTorneoId);
                try {
                    const data = await getSubtorneos(selectedTorneoId);
                    setSubtorneos(data);
                    console.log('Subtorneos cargados:', data);
                } catch (error) {
                    console.error('Error fetching subtorneos:', error);
                    setSubtorneos([]);
                }
            } else {
                setSubtorneos([]);
                setEquiposNombres([]);
                setSelectedEquipoId(null);
                console.log('selectedTorneoId is null or NaN, resetting subtorneos and equipos');
            }
        };
        fetchSubtorneos();
    }, [selectedTorneoId]);

    useEffect(() => {
        const loadAllEquiposNombres = async () => {
            if (selectedSubtorneoId !== null && !isNaN(selectedSubtorneoId)) {
                setEquiposNombres([]);
                setLoadingEquiposNombres(true);
                let allEquiposNombres: EquipoNombre[] = [];
                let currentPage = 1;
                let totalPages = 1;
                console.log('Fetching equipos for SubTournamentID:', selectedSubtorneoId);

                try {
                    do {
                        const data = await getEquipos(selectedSubtorneoId, currentPage);
                        if (data && data.items) {
                            const nombres = data.items.map(equipo => ({ equipoId: equipo.equipoId, nombre: equipo.nombre }));
                            allEquiposNombres = allEquiposNombres.concat(nombres);
                            totalPages = data.totalPages || 1;
                        } else {
                            totalPages = 0;
                        }
                        currentPage++;
                    } while (currentPage <= totalPages);
                    setEquiposNombres(allEquiposNombres);
                    console.log('Equipos cargados:', allEquiposNombres);
                } catch (error) {
                    console.error('Error fetching equipos para el combo:', error);
                    setEquiposNombres([]);
                } finally {
                    setLoadingEquiposNombres(false);
                }
            } else {
                setEquiposNombres([]);
                setSelectedEquipoId(null);
                console.log('selectedSubtorneoId is null or NaN, resetting equipos');
            }
        };
        loadAllEquiposNombres();
    }, [selectedSubtorneoId]);

    useEffect(() => {
        const fetchJugadoresPorEquipoFn = async (teamId: number) => {
            setLoading(true);
            try {
                const data = await getJugadoresPorEquipo(teamId);
                setJugadores(data.data || []);
                setTotalPages(1);
            } catch (error) {
                console.error('Error al obtener jugadores por equipo:', error);
                setJugadores([]);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };

        if (selectedEquipoId !== null && !isNaN(selectedEquipoId)) {
            fetchJugadoresPorEquipoFn(selectedEquipoId);
        } else {
            setPage(1);
            fetchInitialJugadores();
        }
    }, [selectedEquipoId, fetchInitialJugadores]);

    useEffect(() => {
        if (!selectedTorneoId && !selectedSubtorneoId && !selectedEquipoId && !search) {
            fetchInitialJugadores();
        }
    }, [page, search, selectedTorneoId, selectedSubtorneoId, selectedEquipoId, fetchInitialJugadores]);

    const handleTorneoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const torneoId = e.target.value === '' ? null : Number(e.target.value);
        setSelectedTorneoId(torneoId);
        setSelectedSubtorneoId(null);
        setSelectedEquipoId(null);
        setPage(1);
        setJugadores([]);
        console.log('Torneo seleccionado:', torneoId);
    };

    const handleSubtorneoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subtorneoId = e.target.value === '' ? null : Number(e.target.value);
        setSelectedSubtorneoId(subtorneoId);
        setSelectedEquipoId(null);
        setPage(1);
        setJugadores([]);
        console.log('Subtorneo seleccionado:', subtorneoId);
    };

    const handleEquipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const equipoId = e.target.value === '' ? null : Number(e.target.value);
        setSelectedEquipoId(equipoId);
        setPage(1);
        setJugadores([]);
        console.log('Equipo seleccionado:', equipoId);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            let query = `${API_BASE_URL}/Players/Buscar?query=${search}`;
            if (selectedTorneoId) {
                query += `&TournamentId=${selectedTorneoId}`;
            }
            if (selectedSubtorneoId) {
                query += `&SubTournamentId=${selectedSubtorneoId}`;
            }
            if (selectedEquipoId) {
                query += `&TeamId=${selectedEquipoId}`;
            }

            const response = await fetch(query);
            const data: any = await response.json();
            setJugadores(data.data || []);
            setTotalPages(1);
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            setJugadores([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const shouldShowJugadores = () => {
        if (selectedEquipoId !== null) {
            return jugadores.length > 0;
        }
        if (selectedSubtorneoId !== null) {
            return jugadores.length > 0;
        }
        if (selectedTorneoId !== null) {
            return jugadores.length > 0;
        }
        return true; // Mostrar la lista inicial si no hay filtros aplicados
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Lista de Jugadores</h2>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={search}
                                onChange={handleSearchChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-2">
                            <Form.Select onChange={handleTorneoChange} value={selectedTorneoId || ''}>
                                <option value="">Torneo</option>
                                {torneos.map((torneo) => (
                                    <option key={torneo.tournamentId} value={torneo.torneoId}>
                                        {torneo.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                        <div className="col-md-2">
                            <Form.Select
                                onChange={handleSubtorneoChange}
                                disabled={!selectedTorneoId || subtorneos.length === 0}
                                value={selectedSubtorneoId || ''}
                            >
                                <option value="">Subtorneo</option>
                                {subtorneos.length === 0 && selectedTorneoId !== null ? (
                                    <option disabled>No hay subtorneos para este torneo</option>
                                ) : (
                                    subtorneos.map((subtorneo) => (
                                        <option key={subtorneo.subTournamentId} value={subtorneo.subTorneoId}>
                                            {subtorneo.categoria}
                                        </option>
                                    ))
                                )}
                            </Form.Select>
                        </div>
                        <div className="col-md-2">
                            <Form.Select
                                onChange={handleEquipoChange}
                                disabled={!selectedSubtorneoId || loadingEquiposNombres || equiposNombres.length === 0}
                                value={selectedEquipoId || ''}
                            >
                                <option value="">Equipo</option>
                                {equiposNombres.length === 0 && selectedSubtorneoId !== null ? (
                                    <option disabled>No hay equipos para este subtorneo</option>
                                ) : (
                                    equiposNombres.map((equipo) => (
                                        <option key={equipo.equipoId} value={equipo.equipoId}>
                                            {equipo.nombre}
                                        </option>
                                    ))
                                )}
                            </Form.Select>
                            {loadingEquiposNombres && <p className="mt-1 text-muted">Cargando equipos...</p>}
                        </div>
                        <div className="col-md-3">
                            <button onClick={handleSearch} className="btn btn-primary w-100">
                                Buscar
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        {shouldShowJugadores() ? (
                            jugadores.length > 0 ? (
                                jugadores.map((jugador) => (
                                    <div className="col-md-3 mb-3" key={jugador.jugadorId}>
                                        <div className="card h-100">
                                            <img
                                                src={jugador.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'}
                                                className="card-img-top"
                                                alt={jugador.nombre}
                                                style={{ objectFit: 'cover', height: '260px' }}
                                            />
                                            <div className="card-body">
                                                <h5 className="card-title">{jugador.nombre} {jugador.apellido}</h5>
                                                <p className="card-text">Equipo: {jugador.asignacion?.equipoId}</p>
                                                <p className="card-text">Posición: {jugador.asignacion?.posicionName}</p>
                                                <button
                                                    onClick={() => navigate(`/admin/jugadores/${jugador.jugadorId}`, { state: { jugador } })}
                                                    className="btn btn-success"
                                                >
                                                    Ver Detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !loading && (
                                    <div className="col-12 text-center">
                                        <p>No se encontraron jugadores con los filtros seleccionados.</p>
                                    </div>
                                )
                            )
                        ) : (
                            !loading && (
                                <div className="col-12 text-center">
                                    <p>Seleccione un torneo y/o subtorneo y/o equipo para ver los jugadores.</p>
                                </div>
                            )
                        )}
                    </div>

                    {!selectedEquipoId && jugadores && jugadores.length > 0 && (
                        <div className="d-flex justify-content-center mt-4">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="btn btn-secondary mx-2"
                            >
                                Anterior
                            </button>
                            <span className="align-self-center">Página {page} de {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="btn btn-secondary mx-2"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JugadorList;