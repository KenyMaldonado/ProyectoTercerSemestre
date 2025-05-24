import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    getDepartamentos,
    getMunicipiosByDepartamento,
    getCarrerasByFacultad,
    getSemestreByCarrera
} from '../../../../../services/api';

type Departamento = {
    departamentoId: number;
    nombre: string;
};

type Municipio = {
    municipioId: number;
    nombre: string;
};

type Carrera = {
    carreraId: number;
    nombre: string;
    codigoCarrera: string;
};

type Semestre = {
    codigoCarrera: string;
    semestre: number;
    seccion: string;
};

const JugadorDetail = () => {
    const { jugador } = useLocation().state || {};
    const navigate = useNavigate();
    
    console.log('Jugador recibido:', jugador);
    console.log('facultadID recibido:', jugador?.asignacion?.facultadID);
    
    const [isEditable, setIsEditable] = useState(false);

    // Datos para combos
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [semestres, setSemestres] = useState<Semestre[]>([]);

    // Estado editable del jugador
    const [formData, setFormData] = useState({ ...jugador });

    useEffect(() => {
        if (!jugador) return;

        setFormData({ ...jugador });

        getDepartamentos()
          .then(data => {
            if (Array.isArray(data)) {
              setDepartamentos(data);
            } else {
              console.error("Respuesta inesperada en getDepartamentos:", data);
            }
          })
          .catch(err => console.error("Error cargando departamentos:", err));

        // Usar asignacion.facultadID ya que es donde se guarda el valor
        if (jugador?.asignacion?.facultadID) {
            getCarrerasByFacultad(jugador.asignacion.facultadID).then(setCarreras);
        } else {
            console.warn("facultadID es null o undefined");
        }

        if (jugador.departamentoId) {
            getMunicipiosByDepartamento(jugador.departamentoId).then(setMunicipios);
        }

        if (jugador.carreraId) {
            getSemestreByCarrera(jugador.carreraId).then(setSemestres);
        }
    }, [jugador]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Actualiza municipios si se cambia departamento
        if (name === 'departamentoId') {
            getMunicipiosByDepartamento(value).then(setMunicipios);
            setFormData(prev => ({ ...prev, municipioId: '' }));
        }

        // Actualiza semestres si se cambia carrera
        if (name === 'carreraId') {
        getSemestreByCarrera(value).then(data => {
            setSemestres(data || []);

            if (data && data.length > 0) {
            setFormData(prev => ({
                ...prev,
                carreraId: value,
                semestre: data[0].semestre,
                seccion: data[0].seccion
            }));
            }
        });
        }
    };

    const formatFecha = (fecha: string) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES');
    };

    if (!jugador) {
        return (
            <div className="container mt-5">
                <h2>No se encontraron detalles del jugador.</h2>
                <button onClick={() => navigate(-1)} className="btn btn-primary mt-3">Volver</button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <h2 className="text-center mb-4">Ficha del Jugador</h2>
                <div className="row">
                    <div className="col-md-4 text-center mb-3">
                        <img
                            src={jugador.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'}
                            alt="Foto del Jugador"
                            className="img-thumbnail"
                            style={{ width: '100%', maxWidth: '250px', height: 'auto' }}
                        />
                    </div>

                    <div className="col-md-8">
                        <div className="row">
                            {[
                                { label: 'Nombre', key: 'nombre' },
                                { label: 'Apellido', key: 'apellido' },
                                { label: 'Carne', key: 'carne' },
                                { label: 'Edad', key: 'edad' },
                                {
                                    label: 'Fecha de Nacimiento',
                                    key: 'fechaNacimiento',
                                    render: () => (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formatFecha(formData.fechaNacimiento)}
                                            disabled
                                        />
                                    )
                                },
                                { label: 'Teléfono', key: 'telefono' },
                            ].map(({ label, key, render }) => (
                                <div className="col-md-6 mb-3" key={key}>
                                    <label className="form-label">{label}</label>
                                    {render ? render() : (
                                        <input
                                            type="text"
                                            name={key}
                                            className="form-control"
                                            value={formData[key] || ''}
                                            onChange={handleChange}
                                            disabled={!isEditable}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Combos dinámicos */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Carrera</label>
                                <select
                                    className="form-select"
                                    name="carreraId"
                                    value={formData.carreraId || ''}
                                    onChange={handleChange}
                                    disabled={!isEditable}
                                >
                                    <option value="">Seleccione carrera</option>
                                    {carreras.map(c => (
                                        <option key={c.carreraId} value={c.carreraId}>{c.nombre || c.codigoCarrera}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Código de Carrera</label>
                                <select
                                className="form-select"
                                name="codigoCarrera"
                                value={formData.carreraSemestreId || ''}
                                onChange={(e) => {
                                    const selectedCodigo = e.target.value;
                                    const selectedSemestre = semestres.find(s => s.codigoCarrera === selectedCodigo);
                                    
                                    if (selectedSemestre) {
                                    setFormData(prev => ({
                                        ...prev,
                                        codigoCarrera: selectedCodigo,
                                        semestre: selectedSemestre.semestre,
                                        seccion: selectedSemestre.seccion
                                    }));
                                    }
                                }}
                                disabled={!isEditable}
                                >
                                <option value="">Seleccione código</option>
                                {[...new Set(semestres.map(s => s.codigoCarrera))].map(codigo => (
                                    <option key={codigo} value={codigo}>{codigo}</option>
                                ))}
                                </select>
                            </div>


                            <div className="col-md-6 mb-3">
                            <label className="form-label">Semestre</label>
                            <input
                                type="text"
                                className="form-control"
                                name="semestre"
                                value={formData.semestre || ''}
                                disabled
                            />
                            </div>

                            <div className="col-md-6 mb-3">
                            <label className="form-label">Sección</label>
                            <input
                                type="text"
                                className="form-control"
                                name="seccion"
                                value={formData.seccion || ''}
                                disabled
                            />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Departamento</label>
                                <select
                                    className="form-select"
                                    name="departamentoId"
                                    value={formData.departamentoId || ''}
                                    onChange={handleChange}
                                    disabled={!isEditable}
                                >
                                    <option value="">Seleccione departamento</option>
                                    {departamentos.map(d => (
                                        <option key={d.departamentoId} value={d.departamentoId}>{d.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Municipio</label>
                                <select
                                    className="form-select"
                                    name="municipioId"
                                    value={formData.municipioId || ''}
                                    onChange={handleChange}
                                    disabled={!isEditable}
                                >
                                    <option value="">Seleccione municipio</option>
                                    {municipios.map(m => (
                                        <option key={m.municipioId} value={m.municipioId}>{m.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Estado</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="estadoTexto"
                                    value={formData.estadoTexto || 'No disponible'}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (isEditable) {
                                // TODO: Guardar cambios aquí
                                console.log('Datos editados:', formData);
                            }
                            setIsEditable(!isEditable);
                        }}
                        className={`btn ${isEditable ? 'btn-success' : 'btn-warning'} me-2`}
                    >
                        {isEditable ? 'Guardar' : 'Editar'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JugadorDetail;
