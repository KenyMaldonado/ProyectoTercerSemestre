import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    getEquiposPorSubtorneo, 
    EquipoSubtorneo, 
    iniciarTodosContraTodos, // Importa directamente tu función de API
    DiaPartido,              // Importa la interfaz DiaPartido
    IniciarTodosContraTodosPayload // Importa la interfaz del payload
} from '../../../services/tournamentService'; 
import { FaUsers, FaArrowLeft, FaInfoCircle, FaCalendarAlt, FaClock, FaCheckCircle, FaCalendarTimes, FaTimesCircle, FaFlag, FaArrowRight } from 'react-icons/fa'; // Importa FaArrowRight
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'animate.css';

// Para manejar la tipificación de Date de forma segura con react-datepicker
type DateType = Date;

interface LocationState {
    torneoNombre: string;
    subtorneoNombre: string;
    torneoDescripcion?: string;
    subtorneoDescripcion?: string;
    selectedSubtorneoId: number;
    fechaInicio?: string; // Fecha de inicio del torneo
    fechaFin?: string;   // Fecha de fin del torneo
    tipoTorneo?: string;
}

interface HorarioDiaInterno {
    id: number;
    horaInicio: string;
    horaFin: string;
}

interface DiaSeleccionadoInterno {
    diaSemana: string;
    horarios: HorarioDiaInterno[];
}

const TournamentSetupWizard: React.FC = () => {
    const { subTorneoId } = useParams<{ subTorneoId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [equipos, setEquipos] = useState<EquipoSubtorneo[]>([]);
    const [cargandoEquipos, setCargandoEquipos] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        torneoNombre,
        subtorneoNombre,
        torneoDescripcion,
        subtorneoDescripcion,
        fechaInicio, // Propiedad fechaInicio del torneo
        fechaFin,    // Propiedad fechaFin del torneo
        tipoTorneo
    } = (location.state as LocationState) || {};

    // Parsear fechas de inicio y fin para usarlas en DatePicker
    const parsedFechaInicio = fechaInicio ? new Date(fechaInicio) : null;
    const parsedFechaFin = fechaFin ? new Date(fechaFin) : null;


    // Usa la interfaz interna para el estado del componente
    const [diasSeleccionados, setDiasSeleccionados] = useState<DiaSeleccionadoInterno[]>([]);
    // 1. Días de la semana limitados de Lunes a Viernes
    const diasDeLaSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    const [fechasOmitidas, setFechasOmitidas] = useState<DateType[]>([]);
    const [tempSelectedDate, setTempSelectedDate] = useState<DateType | null>(null);

    const formatISODateToLocale = (isoString?: string): string => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) {
                return 'Fecha inválida';
            }
            // Asegúrate de que la fecha se muestre correctamente en la zona horaria local
            // Considera el caso de fechas sin componente de tiempo, que pueden interpretarse como UTC
            // y al convertirlas a local, restar un día si la hora es 00:00 UTC.
            // Una forma robusta es crearla como UTC y luego formatearla.
            const [year, month, day] = isoString.split('-').map(Number);
            const dateUTC = new Date(Date.UTC(year, month - 1, day)); // Usa UTC para evitar desfasos
            
            return dateUTC.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            console.error('Error al parsear fecha:', isoString, e);
            return 'Fecha inválida';
        }
    };

    const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 90;

    useEffect(() => {
        if (!subTorneoId) {
            setError('ID de subtorneo no proporcionado.');
            setCargandoEquipos(false);
            Swal.fire('Error', 'No se encontró el ID del subtorneo. Regresa a la selección.', 'error');
            return;
        }

        const fetchEquipos = async () => {
            try {
                const id = parseInt(subTorneoId);
                if (isNaN(id)) {
                    setError('ID de subtorneo inválido.');
                    Swal.fire('Error', 'El ID del subtorneo no es un número válido.', 'error');
                    return;
                }
                const data = await getEquiposPorSubtorneo(id);
                setEquipos(data);
                if (data.length === 0) {
                    Swal.fire('Información', 'No se encontraron equipos inscritos para este subtorneo.', 'info');
                }
            } catch (err) {
                console.error('Error al obtener equipos:', err);
                setError('Error al cargar los equipos inscritos.');
                Swal.fire('Error', 'Hubo un problema al cargar los equipos.', 'error');
            } finally {
                setCargandoEquipos(false);
            }
        };

        fetchEquipos();
    }, [subTorneoId]);

    const handleNext = () => {
        if (currentStep === 2) {
            const diasConHorariosValidos = diasSeleccionados.filter(d =>
                d.horarios.length > 0 && d.horarios.every(h => h.horaInicio && h.horaFin)
            );

            if (diasConHorariosValidos.length === 0) {
                Swal.fire('Advertencia', 'Debes seleccionar al menos un día y definir al menos un rango de horario para poder continuar.', 'warning');
                return;
            }

            for (const dia of diasSeleccionados) {
                if (dia.horarios.length > 0) {
                    for (const horario of dia.horarios) {
                        if (!horario.horaInicio || !horario.horaFin) {
                            Swal.fire('Advertencia', `Por favor, completa los rangos de horario para el día ${dia.diaSemana}.`, 'warning');
                            return;
                        }
                        if (horario.horaInicio >= horario.horaFin) {
                            Swal.fire('Advertencia', `La hora de inicio (${horario.horaInicio}) debe ser anterior a la hora de fin (${horario.horaFin}) para los horarios del día ${dia.diaSemana}.`, 'warning');
                            return;
                        }
                    }
                }
            }
        }
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleGoBackToSelector = () => {
        navigate('/admin/torneos/iniciar');
    };

    const handleDiaToggle = (dia: string) => {
        setDiasSeleccionados(prev => {
            if (prev.some(d => d.diaSemana === dia)) {
                return prev.filter(d => d.diaSemana !== dia);
            } else {
                return [...prev, { diaSemana: dia, horarios: [{ id: Date.now(), horaInicio: '08:00', horaFin: '17:00' }] }];
            }
        });
    };

    const handleAddHorario = (dia: string) => {
        setDiasSeleccionados(prev =>
            prev.map(d =>
                d.diaSemana === dia
                    ? { ...d, horarios: [...d.horarios, { id: Date.now() + Math.random(), horaInicio: '', horaFin: '' }] }
                    : d
            )
        );
    };

    const handleRemoveHorario = (dia: string, horarioId: number) => {
        setDiasSeleccionados(prev =>
            prev.map(d =>
                d.diaSemana === dia
                    ? { ...d, horarios: d.horarios.filter(h => h.id !== horarioId) }
                    : d
            )
        );
    };

    const handleHorarioChange = (dia: string, horarioId: number, field: 'horaInicio' | 'horaFin', value: string) => {
        setDiasSeleccionados(prev =>
            prev.map(d =>
                d.diaSemana === dia
                    ? {
                        ...d,
                        horarios: d.horarios.map(h =>
                            h.id === horarioId ? { ...h, [field]: value } : h
                        )
                    }
                    : d
            )
        );
    };

    const handleAddFechaOmitida = (date: DateType | null) => {
        if (date) {
            setFechasOmitidas(prev => {
                const newDateFormatted = date.toDateString();
                if (!prev.some(d => d.toDateString() === newDateFormatted)) {
                    return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
                }
                return prev;
            });
            setTempSelectedDate(null);
        }
    };

    const handleRemoveFechaOmitida = (dateToRemove: DateType) => {
        setFechasOmitidas(prev => prev.filter(date => date.toDateString() !== dateToRemove.toDateString()));
    };

    const handleConfirmSetup = async () => {
        Swal.fire({
            title: '¿Confirmar Configuración del Torneo?',
            html: `Estás a punto de configurar el torneo <strong>${torneoNombre}</strong>, subtorneo <strong>${subtorneoNombre}</strong>.<br/><br/>Esta acción iniciará el proceso de planificación de partidos basado en tu configuración.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'No, revisar',
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn btn-success me-2',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Mostrar SweetAlert de "Comprobando disponibilidad"
                Swal.fire({
                    title: 'Comprobando disponibilidad...',
                    text: 'Esto puede tomar un momento.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading(null);
                    }
                });

                try {
                    // Validar que subTorneoId no sea nulo
                    if (!subTorneoId) {
                        throw new Error('ID de subtorneo no disponible para iniciar el proceso.');
                    }

                    // Extraer los IDs de los equipos
                    const equiposId = equipos.map(equipo => equipo.equipoId);

                    // Mapear los días y horarios al formato que espera la API
                    const diasPartidos: DiaPartido[] = diasSeleccionados.map(dia => ({
                        dia: dia.diaSemana,
                        // El `horarios` de la API espera un array de strings (ej: ["18:00", "20:00"])
                        horarios: dia.horarios.flatMap(h => [h.horaInicio, h.horaFin])
                    }));

                    // Mapear las fechas omitidas a formato "YYYY-MM-DD"
                    const diasOmitidos = fechasOmitidas.map(date => date.toISOString().split('T')[0]);

                    // Construir el payload completo para la API
                    const payload: IniciarTodosContraTodosPayload = {
                        subtorneoId: parseInt(subTorneoId),
                        equiposId: equiposId,
                        diasPartidos: diasPartidos,
                        diasOmitidos: diasOmitidos
                    };

                    console.log('Enviando configuración al endpoint IniciarTodosContraTodos:', payload);

                    // Simula un retraso para la "comprobación de disponibilidad"
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Actualiza el SweetAlert a "Creando torneo"
                    Swal.update({
                        title: 'Creando torneo...',
                        text: 'Estamos generando la planificación de partidos. Esto puede tardar unos segundos.',
                        icon: undefined 
                    });

                    // Llama a tu función de API real
                    const success = await iniciarTodosContraTodos(payload);

                    if (success) {
                        Swal.fire(
                            '¡Configurado!',
                            'El torneo ha sido configurado exitosamente y está listo para la planificación de partidos.',
                            'success'
                        ).then(() => {
                            navigate('/admin/torneos/iniciar');
                        });
                    } else {
                        // Esto se activará si iniciarTodosContraTodos retorna 'false'
                        Swal.fire(
                            'Error',
                            'La configuración del torneo falló en el servidor. Por favor, revisa los datos o intenta de nuevo más tarde.',
                            'error'
                        );
                    }

                } catch (apiError: any) {
                    console.error('Error al configurar el torneo:', apiError);
                    Swal.fire(
                        'Error',
                        `Hubo un problema al configurar el torneo: ${apiError.message || 'Error desconocido'}. Por favor, intenta de nuevo.`,
                        'error'
                    );
                }
            }
        });
    };

    if (cargandoEquipos) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Cargando equipos...</span>
                </div>
                <p className="ms-3 text-secondary">Cargando equipos inscritos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">¡Error!</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary mt-3" onClick={handleGoBackToSelector}>
                        Regresar a la selección de Torneos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-center text-dark fw-bold">
                <FaUsers className="me-3 text-primary" /> Configuración del Torneo
            </h1>

            <div className="progress-wizard mb-5">
                <div className="progress-bar-bg"></div>
                <div className="progress-fill" style={{ width: `${progressWidth}%` }}></div>

                {[1, 2, 3, 4].map((stepNum) => (
                    <div key={stepNum} className={`progress-step ${currentStep >= stepNum ? 'active' : ''} ${currentStep === stepNum ? 'current' : ''}`}>
                        <div className="progress-bubble">
                            {stepNum === 1 && <FaInfoCircle />}
                            {stepNum === 2 && <FaCalendarAlt />}
                            {stepNum === 3 && <FaCalendarTimes />}
                            {stepNum === 4 && <FaCheckCircle />}
                        </div>
                        <div className="progress-label">
                            {stepNum === 1 && 'Equipos'}
                            {stepNum === 2 && 'Días y Horarios'}
                            {stepNum === 3 && 'Fechas Omitidas'}
                            {stepNum === 4 && 'Resumen'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card shadow-lg p-4 p-md-5">
                <div className="card-body">
                    {/* --- Paso 1: Resumen y Equipos --- */}
                    {currentStep === 1 && (
                        <div className="fade-in animate__animated animate__fadeIn">
                            <h2 className="mb-4 text-primary fw-bold text-center">
                                <FaInfoCircle className="me-2" /> Paso 1: Resumen del Evento y Equipos
                            </h2>
                            <div className="card shadow-sm p-4 mb-4 border-start border-primary border-4">
                                <div className="card-body">
                                    <h4 className="card-title mb-3 text-primary fw-bold">Detalles</h4>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Torneo:</label>
                                            <input type="text" className="form-control" value={torneoNombre || 'N/A'} disabled />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Subtorneo:</label>
                                            <input type="text" className="form-control" value={subtorneoNombre || 'N/A'} disabled />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Fecha de Inicio:</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formatISODateToLocale(fechaInicio)}
                                                disabled
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Fecha de Fin:</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formatISODateToLocale(fechaFin)}
                                                disabled
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Tipo de Torneo:</label>
                                            <input type="text" className="form-control" value={tipoTorneo || 'N/A'} disabled />
                                        </div>
                                        {torneoDescripcion && (
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">Descripción del Torneo:</label>
                                                <textarea className="form-control" value={torneoDescripcion} rows={2} disabled />
                                            </div>
                                        )}
                                        {subtorneoDescripcion && (
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">Descripción del Subtorneo:</label>
                                                <textarea className="form-control" value={subtorneoDescripcion} rows={2} disabled />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 className="mb-4 text-center text-secondary fw-bold">
                                Equipos Inscritos ({equipos.length})
                            </h3>
                            {equipos.length === 0 ? (
                                <div className="alert alert-info text-center" role="alert">
                                    No hay equipos inscritos para este subtorneo aún.
                                </div>
                            ) : (
                                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                                    {equipos.map((equipo) => (
                                        <div key={equipo.equipoId} className="col">
                                            <div className="card h-100 shadow-sm border border-secondary border-3 team-card">
                                                {equipo.imagenEquipo && (
                                                    <img
                                                        src={equipo.imagenEquipo}
                                                        className="card-img-top mx-auto mt-3 rounded-circle"
                                                        alt={`Imagen de ${equipo.nombre}`}
                                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                <div className="card-body text-center d-flex flex-column">
                                                    <h5 className="card-title fw-bold text-primary mb-2">{equipo.nombre}</h5>
                                                    <p className="card-text mb-1"><small className="text-muted">Facultad:</small> {equipo.nameFacultad || 'N/A'}</p>
                                                    <p className="card-text mb-1"><small className="text-muted">Uniforme:</small> {equipo.colorUniforme} {equipo.colorUniformeSecundario ? `y ${equipo.colorUniformeSecundario}` : ''}</p>
                                                    <p className="card-text mt-auto"><small className="text-muted">Estado:</small> <span className="badge bg-success">{equipo.estado}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- Paso 2: Selección de Días y Horarios --- */}
                    {currentStep === 2 && (
                        <div className="fade-in animate__animated animate__fadeIn">
                            <h2 className="mb-4 text-primary fw-bold text-center">
                                <FaCalendarAlt className="me-2" /> Paso 2: Días y Horarios Disponibles
                            </h2>
                            <p className="text-muted text-center mb-4">Selecciona los días de la semana y define los rangos de horarios en los que se pueden jugar partidos.</p>

                            <div className="row g-3">
                                {diasDeLaSemana.map(dia => (
                                    <div key={dia} className="col-md-6 col-lg-4">
                                        <div className={`card h-100 p-3 shadow-sm ${diasSeleccionados.some(d => d.diaSemana === dia) ? 'border-primary border-3' : 'border-light'}`}>
                                            <div className="form-check form-switch mb-3">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`switch-${dia}`}
                                                    checked={diasSeleccionados.some(d => d.diaSemana === dia)}
                                                    onChange={() => handleDiaToggle(dia)}
                                                />
                                                <label className="form-check-label fw-bold text-dark" htmlFor={`switch-${dia}`}>
                                                    {dia}
                                                </label>
                                            </div>

                                            {diasSeleccionados.some(d => d.diaSemana === dia) && (
                                                <div className="horarios-section mt-3">
                                                    {diasSeleccionados.find(d => d.diaSemana === dia)?.horarios.map(horario => (
                                                        <div key={horario.id} className="input-group mb-2 animate__animated animate__fadeIn">
                                                            <input
                                                                type="time"
                                                                className="form-control"
                                                                value={horario.horaInicio}
                                                                onChange={(e) => handleHorarioChange(dia, horario.id, 'horaInicio', e.target.value)}
                                                                placeholder="Inicio"
                                                            />
                                                            <span className="input-group-text">-</span>
                                                            <input
                                                                type="time"
                                                                className="form-control"
                                                                value={horario.horaFin}
                                                                onChange={(e) => handleHorarioChange(dia, horario.id, 'horaFin', e.target.value)}
                                                                placeholder="Fin"
                                                            />
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                type="button"
                                                                onClick={() => handleRemoveHorario(dia, horario.id)}
                                                            >
                                                                <FaTimesCircle />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        className="btn btn-outline-primary btn-sm mt-2 w-100"
                                                        onClick={() => handleAddHorario(dia)}
                                                    >
                                                        + Añadir Horario
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- Paso 3: Omisión de Fechas --- */}
                    {currentStep === 3 && (
                        <div className="fade-in animate__animated animate__fadeIn">
                            <h2 className="mb-4 text-primary fw-bold text-center">
                                <FaCalendarTimes className="me-2" /> Paso 3: Fechas a Omitir (Descanso)
                            </h2>
                            <p className="text-muted text-center mb-4">Selecciona las fechas específicas en las que NO se deben programar partidos. Esto es opcional.</p>

                            <div className="row justify-content-center">
                                <div className="col-lg-6">
                                    <div className="card shadow-sm p-4">
                                        <h5 className="mb-3">Selecciona una fecha:</h5>
                                        <DatePicker
                                            selected={tempSelectedDate}
                                            onChange={handleAddFechaOmitida}
                                            dateFormat="dd/MM/yyyy"
                                            className="form-control mb-3 text-center"
                                            placeholderText="Haz click para seleccionar una fecha"
                                            minDate={parsedFechaInicio || undefined} // 2. Restringir minDate
                                            maxDate={parsedFechaFin || undefined}   // 2. Restringir maxDate
                                            portalId="root-portal"
                                            wrapperClassName="w-100"
                                        />
                                        {fechasOmitidas.length > 0 && (
                                            <>
                                                <h5 className="mt-4 mb-3">Fechas omitidas:</h5>
                                                <ul className="list-group">
                                                    {fechasOmitidas.map((date, index) => (
                                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center animate__animated animate__fadeIn">
                                                            {date instanceof Date && !isNaN(date.getTime())
                                                                ? date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                                : 'Fecha inválida'}
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                type="button"
                                                                onClick={() => handleRemoveFechaOmitida(date)}
                                                            >
                                                                <FaTimesCircle />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                        {fechasOmitidas.length === 0 && (
                                            <p className="text-muted text-center mt-3">No hay fechas omitidas seleccionadas.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Paso 4: Resumen Final --- */}
                    {currentStep === 4 && (
                        <div className="fade-in animate__animated animate__fadeIn">
                            <h2 className="mb-4 text-primary fw-bold text-center">
                                <FaCheckCircle className="me-2" /> Paso 4: Resumen y Confirmación
                            </h2>
                            <p className="text-muted text-center mb-4">Revisa la configuración antes de iniciar el torneo. Si todo es correcto, confirma.</p>

                            <div className="card shadow-lg p-4 mb-4 resume-card">
                                <h4 className="card-title mb-3 text-secondary border-bottom pb-2">Detalles del Evento</h4>
                                <ul className="list-group list-group-flush mb-4">
                                    <li className="list-group-item"><strong>Torneo:</strong> {torneoNombre || 'N/A'}</li>
                                    <li className="list-group-item"><strong>Subtorneo:</strong> {subtorneoNombre || 'N/A'}</li>
                                    <li className="list-group-item">
                                        <FaCalendarAlt className="me-2 text-info" /><strong>Fecha de Inicio:</strong> {formatISODateToLocale(fechaInicio)}
                                    </li>
                                    <li className="list-group-item">
                                        <FaCalendarAlt className="me-2 text-info" /><strong>Fecha de Fin:</strong> {formatISODateToLocale(fechaFin)}
                                    </li>
                                    <li className="list-group-item">
                                        <FaFlag className="me-2 text-info" /><strong>Tipo de Torneo:</strong> {tipoTorneo || 'N/A'}
                                    </li>
                                </ul>

                                <h4 className="card-title mb-3 text-secondary border-bottom pb-2">Días y Horarios Seleccionados</h4>
                                {diasSeleccionados.length === 0 ? (
                                    <p className="text-muted">No se han seleccionado días ni horarios.</p>
                                ) : (
                                    <ul className="list-group list-group-flush mb-4">
                                        {diasSeleccionados.map(dia => (
                                            <li key={dia.diaSemana} className="list-group-item">
                                                <strong className="text-primary">{dia.diaSemana}:</strong>
                                                <ul className="list-unstyled ms-3 mt-1">
                                                    {dia.horarios.map((horario, idx) => (
                                                        <li key={idx}><FaClock className="me-1 text-success" /> {horario.horaInicio} - {horario.horaFin}</li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <h4 className="card-title mb-3 text-secondary border-bottom pb-2">Fechas a Omitir</h4>
                                {fechasOmitidas.length === 0 ? (
                                    <p className="text-muted">No se han seleccionado fechas a omitir.</p>
                                ) : (
                                    <ul className="list-group list-group-flush mb-4">
                                        {fechasOmitidas.map((date, index) => (
                                            <li key={index} className="list-group-item">
                                                <FaCalendarTimes className="me-2 text-danger" /> {date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Mostrar equipos en el resumen */}
                                <h4 className="card-title mb-3 text-secondary border-bottom pb-2">Equipos Inscritos</h4>
                                {equipos.length === 0 ? (
                                    <p className="text-muted">No hay equipos inscritos para este subtorneo.</p>
                                ) : (
                                    <ul className="list-group list-group-flush">
                                        {equipos.map((equipo) => (
                                            <li key={equipo.equipoId} className="list-group-item d-flex align-items-center">
                                                {equipo.imagenEquipo && (
                                                    <img 
                                                        src={equipo.imagenEquipo} 
                                                        alt={equipo.nombre} 
                                                        className="rounded-circle me-3" 
                                                        // Aumentar el tamaño de la imagen para mejor visibilidad en el resumen
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                <span className="fw-semibold text-dark">{equipo.nombre}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- Botones de Navegación --- */}
                    <div className="d-flex justify-content-between mt-4">
                        {currentStep > 1 && (
                            <button className="btn btn-secondary" onClick={handleBack}>
                                <FaArrowLeft className="me-2" /> Anterior
                            </button>
                        )}
                        {currentStep < totalSteps ? (
                            <button className="btn btn-primary ms-auto" onClick={handleNext}>
                                Siguiente <FaArrowRight className="ms-2" /> {/* Cambiado a FaArrowRight y removido rotate-icon */}
                            </button>
                        ) : (
                            <button className="btn btn-success ms-auto" onClick={handleConfirmSetup}>
                                <FaCheckCircle className="me-2" /> Confirmar y Crear Torneo
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentSetupWizard;