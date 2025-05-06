import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTournamentData, { Tournament } from '../../../hook/useTournamentData';
import { FaEdit } from 'react-icons/fa'; // Ícono de lápiz

const Torneos: React.FC = () => {
  const navigate = useNavigate();
  const {
    tournaments,
    subTournamentsMap,
    fetchSubTorneos,
  } = useTournamentData();

  const [expanded, setExpanded] = useState<number | null>(null);

  const handleCrearTorneo = () => {
    navigate('/torneos/crear');
  };

  const toggleExpand = (torneoId: number) => {
    if (expanded === torneoId) {
      setExpanded(null);
    } else {
      setExpanded(torneoId);
      if (!subTournamentsMap[torneoId]) {
        fetchSubTorneos(torneoId);
      }
    }
  };

  const formatoFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎯 Torneos actuales</h2>
        <button
          onClick={handleCrearTorneo}
          className="btn btn-success"
        >
          ➕ Crear Torneo
        </button>
      </div>

      <table className="table table-sm table-bordered mb-0 shadow">
        <thead className="table-success">
          <tr>
            <th></th> {/* Columna para el ícono de editar */}
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Juego</th>
            <th>Inicio del Torneo</th>
            <th>Fin del Torneo</th>
            <th>Inicio inscripción</th>
            <th>Fin inscripción</th>
            <th>Creador</th>
            <th>Estado</th>
            <th>Ver más</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center text-muted">
                No hay torneos disponibles por el momento.
              </td>
            </tr>
          ) : (
            tournaments.map((t: Tournament) => (
              <React.Fragment key={t.torneoId}>
                <tr>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => navigate(`/torneos/editar/${t.torneoId}`)}
                      title="Editar torneo"
                    >
                      <FaEdit />
                    </button>
                  </td>
                  <td>{t.nombre}</td>
                  <td>{t.nameTipoTorneo}</td>
                  <td>{t.nameTipoJuego}</td>
                  <td>{formatoFecha(t.fechaInicio)}</td>
                  <td>{formatoFecha(t.fechaFin)}</td>
                  <td>{formatoFecha(t.fechaInicioInscripcion)}</td>
                  <td>{formatoFecha(t.fechaFinInscripcion)}</td>
                  <td>{t.creadoPor}</td>
                  <td>{t.estado}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => toggleExpand(t.torneoId)}
                    >
                      {expanded === t.torneoId ? 'Ocultar' : 'Ver'}
                    </button>
                  </td>
                </tr>
                {expanded === t.torneoId && (
                  <tr>
                    <td colSpan={11}>
                      <div className="p-3 bg-light rounded">
                        <p><strong>📖 Descripción:</strong> {t.descripcion || '—'}</p>
                        <p><strong>📚 Bases del torneo:</strong> {t.basesTorneo || '—'}</p>
                        {subTournamentsMap[t.torneoId] && subTournamentsMap[t.torneoId].length > 0 ? (
                          <div className="mt-3">
                            <h6>🏆 Subtorneos:</h6>
                            <table className="table table-sm table-bordered mb-0">
                              <thead className="table-success">
                                <tr>
                                  <th>Categoría</th>
                                  <th>Estado</th>
                                  <th>Equipos</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subTournamentsMap[t.torneoId].map((sub) => (
                                  <tr key={sub.subTorneoId}>
                                    <td>{sub.categoria}</td>
                                    <td>{sub.estado}</td>
                                    <td>{sub.cantidadEquipos}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-muted m-0">No hay subtorneos registrados o aún se están cargando.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Torneos;