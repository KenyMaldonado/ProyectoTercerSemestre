import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const JugadorDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const jugador = location.state?.jugador;
    const [isEditable, setIsEditable] = useState(false);

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
                    {/* Foto del jugador */}
                    <div className="col-md-4 text-center mb-3">
                        <img
                            src={jugador.fotografia || 'https://documentstorneoumes.blob.core.windows.net/asset/ImagenJugadorNull.png'}
                            alt="Foto del Jugador"
                            className="img-thumbnail"
                            style={{ width: '100%', maxWidth: '250px', height: 'auto' }}
                        />
                    </div>

                    {/* Información básica */}
                    <div className="col-md-8">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Nombre</label>
                                <input type="text" className="form-control" value={jugador.nombre} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Apellido</label>
                                <input type="text" className="form-control" value={jugador.apellido} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Carne</label>
                                <input type="text" className="form-control" value={jugador.carne} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Edad</label>
                                <input type="text" className="form-control" value={jugador.edad} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Fecha de Nacimiento</label>
                                <input type="text" className="form-control" value={jugador.fechaNacimiento} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Teléfono</label>
                                <input type="text" className="form-control" value={jugador.telefono} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Carrera</label>
                                <input type="text" className="form-control" value={jugador.carreraName} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Semestre</label>
                                <input type="text" className="form-control" value={jugador.semestre} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Sección</label>
                                <input type="text" className="form-control" value={jugador.seccion} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Departamento</label>
                                <input type="text" className="form-control" value={jugador.departamentoName} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Municipio</label>
                                <input type="text" className="form-control" value={jugador.municipioName} disabled={!isEditable} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Estado</label>
                                <input type="text" className="form-control" value={jugador.estadoTexto} disabled={!isEditable} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => setIsEditable(!isEditable)}
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
