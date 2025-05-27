import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    getDepartamentos,
    getMunicipiosByDepartamento,
    getCarrerasByFacultad,
    getSemestreByCarrera,
    updateJugador
} from '../../../../../services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

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
};

type Semestre = {
    carreraSemestreId: number;
    codigoCarrera: string;
    carreraId: number;
    semestre: number;
    seccion: string;

};

const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};


const JugadorDetail = () => {
    const { jugador } = useLocation().state || {};
    const navigate = useNavigate();
    
    const [isEditable, setIsEditable] = useState(false);

    // Datos para combos
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [borrarFoto, setBorrarFoto] = useState(false);
    const [nombreMunicipioOriginal, setNombreMunicipioOriginal] = useState<string | null>(null);

    // Estado editable del jugador
    const [formData, setFormData] = useState({ ...jugador });

    useEffect(() => {
        if (!jugador) return;

        setFormData({ ...jugador });

        setNombreMunicipioOriginal(jugador.municipioName ?? null);
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

    useEffect(() => {
        if (
            jugador &&
            carreras.length > 0 &&
            !carreras.find(c => c.carreraId === formData.carreraId)
        ) {
            console.log('Sincronizando carreraId con carreras:', jugador.carreraId);
            setFormData(prev => ({
                ...prev,
                carreraId: jugador.carreraId
            }));
        }
    }, [carreras, jugador, formData.carreraId]);

        const seModificoAlgo = (): boolean => {
        const cambios = Object.keys(jugador).some(key => {
            
            if (['fotografia', 'estadoTexto'].includes(key)) return false;

            return jugador[key] !== formData[key];
        });

        return cambios || borrarFoto || !!formData.file;
    };

    const generarResumenCambios = () => {
    if (!departamentos.length || !municipios.length || !carreras.length) {
        return '<p>Cargando datos para mostrar cambios...</p>';
    }

    let resumen = '';

    const getNombreDepartamento = (id: number) =>
        departamentos.find(d => d.departamentoId === Number(id))?.nombre || `ID ${id}`;

    const getNombreMunicipio = (id: number) =>
    id === jugador.municipioId
        ? nombreMunicipioOriginal ?? `ID ${id}`
        : municipios.find(m => m.municipioId === id)?.nombre ?? `ID ${id}`;

    const getNombreCarrera = (id: number) =>
        carreras.find(c => c.carreraId === Number(id))?.nombre || `ID ${id}`;

    const clavesMostradas = [
        'nombre',
        'apellido',
        'carne',
        'telefono',
        'fechaNacimiento',
        'edad',
        'carreraId',
        'codigoCarrera',
        'semestre',
        'seccion',
        'departamentoId',
        'municipioId'
    ];

    clavesMostradas.forEach((key) => {
        const valorOriginal = jugador[key];
        const valorNuevo = formData[key];

        if (String(valorOriginal) !== String(valorNuevo)) {
            let mostradoOriginal = valorOriginal;
            let mostradoNuevo = valorNuevo;

            switch (key) {
                case 'carreraId':
                    mostradoOriginal = getNombreCarrera(Number(valorOriginal));
                    mostradoNuevo = getNombreCarrera(Number(valorNuevo));
                    break;
                case 'departamentoId':
                    mostradoOriginal = getNombreDepartamento(Number(valorOriginal));
                    mostradoNuevo = getNombreDepartamento(Number(valorNuevo));
                    break;
                case 'municipioId':
                    mostradoOriginal = getNombreMunicipio(Number(valorOriginal));
                    mostradoNuevo = getNombreMunicipio(Number(valorNuevo));
                    break;
                default:
                    break;
            }

            resumen += `
                <tr>
                    <td><strong>${formatearLabel(key)}</strong></td>
                    <td>${mostradoOriginal ?? 'N/A'}</td>
                    <td>→</td>
                    <td>${mostradoNuevo ?? 'N/A'}</td>
                </tr>`;
        }
    });

    if (formData.file) {
        resumen += `
            <tr>
                <td><strong>Foto</strong></td>
                <td colspan="3">Nueva imagen seleccionada</td>
            </tr>`;
    }

    if (borrarFoto) {
        resumen += `
            <tr>
                <td><strong>Foto</strong></td>
                <td colspan="3">Se eliminará la imagen</td>
            </tr>`;
    }

    return resumen
        ? `<table class="table table-sm table-bordered"><tbody>${resumen}</tbody></table>`
        : '<p>No hay cambios.</p>';
};




    const formatearLabel = (key: string) => {
        const map: Record<string, string> = {
            nombre: 'Nombre',
            apellido: 'Apellido',
            carne: 'Carné',
            edad: 'Edad',
            fechaNacimiento: 'Fecha de Nacimiento',
            telefono: 'Teléfono',
            carreraId: 'Carrera',
            codigoCarrera: 'Código de Carrera',
            semestre: 'Semestre',
            seccion: 'Sección',
            departamentoId: 'Departamento',
            municipioId: 'Municipio',
            estadoTexto: 'Estado'
        };
        return map[key] || key;
    };



    const handleActualizar = async () => {
        if (!seModificoAlgo()) {
            await MySwal.fire({
                icon: 'info',
                title: 'Sin cambios',
                text: 'No hiciste ningún cambio para actualizar.',
            });
            return;
        }

        const confirm = await MySwal.fire({
            title: '¿Guardar cambios?',
            html: generarResumenCambios(),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return;

        MySwal.fire({
            title: 'Guardando...',
            allowOutsideClick: false,
            didOpen: () => {
                MySwal.showLoading();
            }
        });

        try {
            await updateJugador(jugador.jugadorId, {
                ...formData,
                borrarFoto: borrarFoto,
            }, formData.file);

            await MySwal.fire({
                title: '¡Guardado!',
                text: 'El jugador ha sido actualizado correctamente.',
                icon: 'success'
            });

            setIsEditable(false);
        } catch (error: any) {
            await MySwal.fire({
                title: 'Error',
                text: error.message || 'Error desconocido al guardar.',
                icon: 'error'
            });
        } finally {
            MySwal.close();
        }
    };


    
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
            const carreraId = parseInt(value, 10);
            setFormData(prev => ({ ...prev, carreraId })); // 👈 Actualiza de inmediato

            getSemestreByCarrera(carreraId).then(data => {
                setSemestres(data || []);

                if (data && data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        semestre: data[0].semestre,
                        seccion: data[0].seccion,
                        carreraSemestreId: data[0].carreraSemestreId,
                        codigoCarrera: data[0].codigoCarrera
                    }));
                }
            });
        }


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
                            src={
                                borrarFoto
                                    ? 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'
                                    : previewImage || jugador.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'
                            }
                            alt="Foto del Jugador"
                            className="img-thumbnail"
                            style={{ width: '100%', maxWidth: '250px', height: 'auto' }}
                        />


                        {isEditable && (
                            <div className="mt-3">
                                <label className="form-label">Actualizar Fotografía</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFormData(prev => ({ ...prev, file }));
                                            setBorrarFoto(false); // se cancela si se sube nueva foto

                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setPreviewImage(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />

                                <button
                                    type="button"
                                    className="btn btn-outline-danger mt-2"
                                    onClick={() => {
                                        setBorrarFoto(true);
                                        setPreviewImage('https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png');
                                        setFormData(prev => ({ ...prev, file: null }));
                                    }}
                                >
                                    Borrar Foto
                                </button>
                            </div>
                        )}

                    </div>

                    
                    <div className="col-md-8">
                        <div className="row">
                            {[
                                { label: 'Nombre', key: 'nombre' },
                                { label: 'Apellido', key: 'apellido' },
                                { label: 'Carne', key: 'carne' },
                                {
                                    label: 'Edad',
                                    key: 'edad',
                                    render: () => (
                                        <input
                                            type="text"
                                            name="edad"
                                            className="form-control"
                                            value={formData.edad || ''}
                                            disabled
                                        />
                                    )
                                },
                                {
                                    label: 'Fecha de Nacimiento',
                                    key: 'fechaNacimiento',
                                    render: () => (
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="fechaNacimiento"
                                            value={formData.fechaNacimiento || ''}
                                            onChange={(e) => {
                                                const nuevaFecha = e.target.value;
                                                const nuevaEdad = calcularEdad(nuevaFecha);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    fechaNacimiento: nuevaFecha,
                                                    edad: nuevaEdad
                                                }));
                                            }}
                                            disabled={!isEditable}
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
                                        <option key={c.carreraId} value={c.carreraId}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            
                            <div className="col-md-6 mb-3">
                            <label className="form-label">Código de Carrera</label>
                            <select
                                className="form-select"
                                name="codigoCarrera"
                                value={formData.codigoCarrera || ''}
                                onChange={(e) => {
                                const selectedCodigo = e.target.value;
                                const selectedSemestre = semestres.find(s => s.codigoCarrera === selectedCodigo);

                                if (selectedSemestre) {
                                    setFormData(prev => ({
                                    ...prev,
                                    codigoCarrera: selectedCodigo,
                                    carreraSemestreId: selectedSemestre.carreraSemestreId,
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
                        onClick={async () => {
                        if (isEditable) {
                        await handleActualizar(); // Solo esta línea
                        } else {
                        setIsEditable(true);
                        }   
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
