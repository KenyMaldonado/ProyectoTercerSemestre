import React, { useEffect, useState } from "react";
import { Torneo } from "./TorneoCard";

const Torneos: React.FC = () => {
    const [torneos, setTorneos] = useState<Torneo[]>([]);
    const [loading, setLoading] = useState(true);
    const [verMasIndex, setVerMasIndex] = useState<number | null>(null);

    useEffect(() => {
        const obtenerTorneos = async () => {
            try {
                const response = await fetch("http://localhost:5291/api/TournamentControllers/GetTournaments");
                const json = await response.json();
                if (json.success) {
                    setTorneos(json.data);
                }
            } catch (error) {
                console.error("Error al cargar torneos", error);
            } finally {
                setLoading(false);
            }
        };

        obtenerTorneos();
    }, []);

    return (
        <div className="max-w-7xl mx-auto mt-10 px-4">
            <h1 className="text-3xl font-bold text-blue-900 text-center mb-6">
                Torneos Activos
            </h1>

            {loading ? (
                <p className="text-center text-gray-500">Cargando torneos...</p>
            ) : torneos.length === 0 ? (
                <p className="text-center text-red-600">No hay torneos activos.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">Nombre</th>
                                <th className="px-4 py-3 text-left">Rama</th>
                                <th className="px-4 py-3 text-left">Fecha</th>
                                <th className="px-4 py-3 text-left">Participantes</th>
                                <th className="px-4 py-3 text-left">Tipo</th>
                                <th className="px-4 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {torneos.map((torneo, index) => (
                                <React.Fragment key={index}>
                                    <tr className="hover:bg-gray-100 transition">
                                        <td className="border-t px-4 py-3">{torneo.nombre}</td>
                                        <td className="border-t px-4 py-3">{torneo.rama}</td>
                                        <td className="border-t px-4 py-3">
                                            {torneo.fechaInicio} - {torneo.fechaFin}
                                        </td>
                                        <td className="border-t px-4 py-3">{torneo.cantidadParticipantes}</td>
                                        <td className="border-t px-4 py-3">{torneo.tipoTorneo}</td>
                                        <td className="border-t px-4 py-3">
                                            <button
                                                onClick={() =>
                                                    setVerMasIndex(verMasIndex === index ? null : index)
                                                }
                                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                                            >
                                                {verMasIndex === index ? "Ocultar" : "Ver más"}
                                            </button>
                                        </td>
                                    </tr>

                                    {verMasIndex === index && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={6} className="px-4 py-3 text-sm text-gray-700">
                                                <p><strong>Descripción:</strong> {torneo.descripcion}</p>
                                                <p><strong>Bases:</strong> {torneo.basesTorneo}</p>
                                                <p><strong>Inscripción:</strong> {torneo.fechaInicioInscripcion} a {torneo.fechaFinInscripcion}</p>
                                                <p><strong>Creado por:</strong> {torneo.createdBy}</p>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Torneos;
