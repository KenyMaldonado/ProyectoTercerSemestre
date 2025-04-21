import React, { useState } from "react";

export interface Torneo {
    nombre: string;
    rama: string;
    fechaInicio: string;
    fechaFin: string;
    descripcion: string;
    basesTorneo: string;
    fechaInicioInscripcion: string;
    fechaFinInscripcion: string;
    cantidadParticipantes: number;
    tipoTorneo: string;
    createdBy: string;
}

const TorneoCard: React.FC<{ torneo: Torneo }> = ({ torneo }) => {
    const [verMas, setVerMas] = useState(false);

    return (
        <div className="border rounded-lg shadow-md p-5 mb-4 bg-white">
            <h2 className="text-xl font-bold text-blue-700">{torneo.nombre}</h2>
            <p className="text-sm text-gray-600">
                Rama: <strong>{torneo.rama}</strong> | Tipo:{" "}
                <strong>{torneo.tipoTorneo}</strong>
            </p>
            <p className="text-sm">
                🗓️ {torneo.fechaInicio} - {torneo.fechaFin}
            </p>
            <p className="mt-2 text-gray-700">
                {verMas ? torneo.descripcion : torneo.descripcion.slice(0, 60) + "..."}
            </p>
            <button
                className="mt-2 text-blue-600 hover:underline text-sm"
                onClick={() => setVerMas((prev) => !prev)}
            >
                {verMas ? "Ver menos" : "Ver más"}
            </button>

            {verMas && (
                <div className="mt-3 text-sm text-gray-800 space-y-1">
                    <p><strong>Bases:</strong> {torneo.basesTorneo}</p>
                    <p><strong>Inscripción:</strong> {torneo.fechaInicioInscripcion} a {torneo.fechaFinInscripcion}</p>
                    <p><strong>Participantes:</strong> {torneo.cantidadParticipantes}</p>
                    <p><strong>Creado por:</strong> {torneo.createdBy}</p>
                </div>
            )}
        </div>
    );
};

export default TorneoCard;
