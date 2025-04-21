import { useEffect, useState } from 'react';

interface Torneo {
    Torneo_ID: number;
    Nombre: string;
    Fecha_Inicio: string;
    Fecha_Fin: string;
    Descripcion: string;
    Bases_Torneo: string;
    Fecha_Inicio_Inscripcion: string;
    Fecha_Fin_Inscripcion: string;
    Cantidad_Participantes: number;
    Tipo_Torneo_ID: number;
}

const Torneos = () => {
    const [torneos, setTorneos] = useState<Torneo[]>([]);
    const [verMasId, setVerMasId] = useState<number | null>(null);

    useEffect(() => {
        const obtenerTorneos = async () => {
            try {
                const response = await fetch('https://tu-api.com/api/torneo/activos'); // Cambia esto por tu API real
                const data = await response.json();
                setTorneos(data);
            } catch (error) {
                console.error("Error al obtener los torneos:", error);
            }
        };

        obtenerTorneos();
    }, []);

    const toggleVerMas = (id: number) => {
        setVerMasId(prevId => (prevId === id ? null : id));
    };

    const formatoFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-GT', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>🎯 Torneos activos</h2>
            {torneos.length === 0 && <p>No hay torneos activos.</p>}
            {torneos.map(torneo => (
                <div key={torneo.Torneo_ID} style={{
                    border: "1px solid #ccc",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "15px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    <h3>{torneo.Nombre}</h3>
                    <p><strong>📅 Fechas:</strong> {formatoFecha(torneo.Fecha_Inicio)} - {formatoFecha(torneo.Fecha_Fin)}</p>
                    <p><strong>📝 Inscripción:</strong> {formatoFecha(torneo.Fecha_Inicio_Inscripcion)} - {formatoFecha(torneo.Fecha_Fin_Inscripcion)}</p>
                    <p><strong>👥 Participantes:</strong> {torneo.Cantidad_Participantes}</p>

                    <button onClick={() => toggleVerMas(torneo.Torneo_ID)}>
                        {verMasId === torneo.Torneo_ID ? 'Ver menos' : 'Ver más'}
                    </button>

                    {verMasId === torneo.Torneo_ID && (
                        <div style={{ marginTop: "10px" }}>
                            <p><strong>📖 Descripción:</strong> {torneo.Descripcion}</p>
                            <p><strong>📚 Bases:</strong> {torneo.Bases_Torneo}</p>
                            <p><strong>🏅 Tipo Torneo ID:</strong> {torneo.Tipo_Torneo_ID}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Torneos;
