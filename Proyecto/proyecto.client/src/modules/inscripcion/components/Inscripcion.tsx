import { useState } from 'react';
import './Inscripcion.css';

const Inscripcion = () => {
    const [paso, setPaso] = useState(1);
    const [formReferencia, setFormReferencia] = useState('');
    const [isNuevaInscripcion, setIsNuevaInscripcion] = useState(null); // Si es nueva inscripci�n o no

    const totalPasos = 4;

    // Generar n�mero de referencia para una nueva inscripci�n
    const generarReferenciaFormulario = () => {
        const referencia = `REF-${Date.now()}`;
        setFormReferencia(referencia);
        localStorage.setItem('formReferencia', referencia); // Guardar referencia
        setIsNuevaInscripcion(true); // Marcar como nueva inscripci�n
    };

    // Cargar referencia si el usuario quiere continuar con una inscripci�n anterior
    const cargarReferenciaFormulario = (referencia) => {
        setFormReferencia(referencia);
        setIsNuevaInscripcion(false);
    };

    const siguiente = () => {
        if (paso < totalPasos) setPaso(paso + 1);
    };

    const anterior = () => {
        if (paso > 1) setPaso(paso - 1);
    };

    const renderPaso = () => {
        switch (paso) {
            case 1:
                return <div><h2>Paso 1: Datos del entrenador</h2><p>Formulario del paso 1...</p></div>;
            case 2:
                return <div><h2>Paso 2: Informaci�n del equipo</h2><p>Formulario del paso 2...</p></div>;
            case 3:
                return <div><h2>Paso 3: Jugadores</h2><p>Formulario del paso 3...</p></div>;
            case 4:
                return <div><h2>Paso 4: Confirmaci�n</h2><p>Resumen final y bot�n de enviar</p></div>;
            default:
                return null;
        }
    };

    return (
        <div className="contenedor-inscripcion">
            <h1>Inscripci�n</h1>

            {isNuevaInscripcion === null ? (
                // Pantalla inicial para elegir si es nueva inscripci�n o continuar con una anterior
                <div>
                    <button onClick={generarReferenciaFormulario}>Iniciar nueva inscripci�n</button>
                    <div>
                        <h3>O continuar con una inscripci�n anterior</h3>
                        <input
                            type="text"
                            placeholder="Ingrese n�mero de referencia"
                            onBlur={(e) => cargarReferenciaFormulario(e.target.value)}
                        />
                    </div>
                </div>
            ) : (
                // Formulario de inscripci�n
                <div>
                    <p><strong>Referencia:</strong> {formReferencia}</p>
                    <p><strong>Fecha y Hora:</strong> {new Date().toLocaleString()}</p>
                    <div className="wizard-bar">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className={`step ${paso >= num ? 'active' : ''}`}>
                                <div className="circle">{num}</div>
                                <div className="label">Paso {num}</div>
                                {num !== totalPasos && <div className="line" />}
                            </div>
                        ))}
                    </div>

                    <div className="contenido-paso">{renderPaso()}</div>

                    <div className="navegacion">
                        <button onClick={anterior} disabled={paso === 1}>Atr�s</button>
                        {paso < totalPasos && <button onClick={siguiente}>Siguiente</button>}
                        {paso === totalPasos && <button>Enviar</button>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inscripcion;
