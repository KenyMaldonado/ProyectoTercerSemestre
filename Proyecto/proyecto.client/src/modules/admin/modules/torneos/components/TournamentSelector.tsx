import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
// Asegúrate de que la ruta sea correcta, ajusta si moviste el archivo
import { getTorneos, getSubtorneos, Torneo, Subtorneo } from '../../../services/tournamentService';
import { FaFutbol, FaClipboardList } from 'react-icons/fa';

const TournamentSelector: React.FC = () => {
    const [torneos, setTorneos] = useState<Torneo[]>([]);
    const [subtorneos, setSubtorneos] = useState<Subtorneo[]>([]);
    const [selectedTorneoId, setSelectedTorneoId] = useState<number | null>(null);
    const [selectedSubtorneoId, setSelectedSubtorneoId] = useState<number | null>(null);
    const [cargandoTorneos, setCargandoTorneos] = useState(true);
    const [cargandoSubtorneos, setCargandoSubtorneos] = useState(false);
    const navigate = useNavigate();

    // Cargar torneos al inicio
    useEffect(() => {
        const fetchTorneos = async () => {
            try {
                const data = await getTorneos();
                setTorneos(data);
            } catch {
                Swal.fire('Error', 'No se pudieron cargar los torneos.', 'error');
            } finally {
                setCargandoTorneos(false);
            }
        };
        fetchTorneos();
    }, []);

    // Cargar subtorneos cuando se selecciona un torneo
    useEffect(() => {
        if (selectedTorneoId) {
            setCargandoSubtorneos(true);
            const fetchSubtorneos = async () => {
                try {
                    const data = await getSubtorneos(selectedTorneoId);
                    setSubtorneos(data);
                    setSelectedSubtorneoId(null); // Resetear subtorneo al cambiar de torneo
                } catch {
                    Swal.fire('Error', 'No se pudieron cargar los subtorneos.', 'error');
                    setSubtorneos([]);
                } finally {
                    setCargandoSubtorneos(false);
                }
            };
            fetchSubtorneos();
        } else {
            setSubtorneos([]);
            setSelectedSubtorneoId(null);
        }
    }, [selectedTorneoId]);

    const handleTorneoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setSelectedTorneoId(id || null);
    };

    const handleSubtorneoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setSelectedSubtorneoId(id || null);
    };

    const handleIniciarTorneo = () => {
        if (selectedTorneoId && selectedSubtorneoId) {
            // USAR LAS PROPIEDADES DE TUS INTERFACES
            const selectedTorneo = torneos.find(t => t.torneoId === selectedTorneoId);
            const selectedSubtorneo = subtorneos.find(st => st.subTorneoId === selectedSubtorneoId);

            if (selectedTorneo && selectedSubtorneo) {
                navigate(`/admin/torneos/iniciar/detalles/${selectedSubtorneoId}`, {
                    state: {
                        // USAR LAS PROPIEDADES DE TUS INTERFACES
                        torneoNombre: selectedTorneo.nombre,
                        subtorneoNombre: selectedSubtorneo.categoria, // 'categoria' es correcto aquí
                        torneoDescripcion: selectedTorneo.descripcion,
                        // Si quieres pasar una descripción del subtorneo, y no existe 'descripcion' en Subtorneo,
                        // considera agregarla a la interfaz o dejarla fuera si no viene de la API.
                        // subtorneoDescripcion: selectedSubtorneo.descripcion, // Comentar/Eliminar si no existe
                        selectedSubtorneoId: selectedSubtorneoId
                    }
                });
            } else {
                Swal.fire('Error', 'No se encontró la información completa del torneo/subtorneo seleccionado.', 'error');
            }
        } else {
            Swal.fire('Atención', 'Por favor, selecciona un Torneo y un Subtorneo.', 'warning');
        }
    };

    return (
        <div className="container py-5">
            <div className="card shadow-lg p-4 p-md-5">
                <div className="card-body text-center">
                    <h1 className="mb-4 text-primary fw-bold">
                        <FaFutbol className="me-3" /> Seleccionar Torneo
                    </h1>
                    <p className="lead mb-4 text-muted">
                        Elige un torneo y un subtorneo para ver los equipos inscritos y gestionar su inicio.
                    </p>

                    <div className="row g-4 mb-4">
                        {/* Selector de Torneo */}
                        <div className="col-md-6">
                            <div className="form-floating">
                                <select
                                    className="form-select"
                                    id="selectTorneo"
                                    value={selectedTorneoId || ''}
                                    onChange={handleTorneoChange}
                                    disabled={cargandoTorneos}
                                    aria-label="Seleccionar Torneo"
                                >
                                    <option value="">{cargandoTorneos ? 'Cargando torneos...' : 'Selecciona un Torneo'}</option>
                                    {torneos.map((torneo) => (
                                        // USAR LAS PROPIEDADES DE TUS INTERFACES
                                        <option key={torneo.torneoId} value={torneo.torneoId}>
                                            {torneo.nombre}
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="selectTorneo">Torneo</label>
                            </div>
                            {cargandoTorneos && (
                                <div className="text-center mt-2">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Cargando torneos...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selector de Subtorneo */}
                        <div className="col-md-6">
                            <div className="form-floating">
                                <select
                                    className="form-select"
                                    id="selectSubtorneo"
                                    value={selectedSubtorneoId || ''}
                                    onChange={handleSubtorneoChange}
                                    disabled={!selectedTorneoId || cargandoSubtorneos}
                                    aria-label="Seleccionar Subtorneo"
                                >
                                    <option value="">
                                        {!selectedTorneoId
                                            ? 'Selecciona primero un Torneo'
                                            : cargandoSubtorneos
                                                ? 'Cargando subtorneos...'
                                                : 'Selecciona un Subtorneo'}
                                    </option>
                                    {subtorneos.map((subtorneo) => (
                                        // USAR LAS PROPIEDADES DE TUS INTERFACES
                                        <option key={subtorneo.subTorneoId} value={subtorneo.subTorneoId}>
                                            {subtorneo.categoria}
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="selectSubtorneo">Subtorneo</label>
                            </div>
                            {cargandoSubtorneos && (
                                <div className="text-center mt-2">
                                    <div className="spinner-border spinner-border-sm text-secondary" role="status">
                                        <span className="visually-hidden">Cargando subtorneos...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botón Iniciar Torneo */}
                    <button
                        className="btn btn-primary btn-lg mt-4 w-50"
                        onClick={handleIniciarTorneo}
                        disabled={!selectedTorneoId || !selectedSubtorneoId}
                    >
                        <FaClipboardList className="me-2" /> Ver Equipos Inscritos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TournamentSelector;