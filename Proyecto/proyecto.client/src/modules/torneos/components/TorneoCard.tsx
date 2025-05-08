import React, { useState } from "react";
import useTournamentData from "../Hooks/useTournamentsData";

const TournamentsCardList: React.FC = () => {
  const { tournaments, subTournamentsMap, fetchSubTorneos } = useTournamentData();
  const [expanded, setExpanded] = useState<number | null>(null);

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

  return (
    <div className="container my-5">
      {/* TÍTULO PRINCIPAL */}
      <div className="text-center mb-5">
        <h1 className="fw-bold display-4 text-gradient">
                Descubre los torneos más competitivos del momento
        </h1>
        <p className="text-muted lead">Elige, participa y demuestra tu habilidad ⚔️</p>
      </div>

      {/* LISTADO DE TORNEOS */}
      <div className="row">
        {tournaments.map((t) => (
          <div className="col-md-6 mb-4" key={t.torneoId}>
            <div className="card shadow-lg border-0 rounded-4 h-100">
              {/* Imagen del torneo */}
              <img
                src={"https://www.prensalibre.com/wp-content/uploads/2018/12/ccbc74c6-7149-42c4-aa43-a9c30641fff3.jpg?quality=52"}
                alt={t.nombre}
                className="card-img-top rounded-top-4"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />

              <div className="card-body">
                <h5 className="card-title text-primary">{t.nombre}</h5>
                <p className="mb-1"><strong>📅 Inicio:</strong> {t.fechaInicio}</p>
                <p className="mb-1"><strong>🏁 Fin:</strong> {t.fechaFin}</p>
                <p className="mb-1"><strong>🎮 Juego:</strong> {t.nameTipoJuego}</p>
                <p className="mb-2"><strong>🏆 Tipo:</strong> {t.nameTipoTorneo}</p>

                <button
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => toggleExpand(t.torneoId)}
                >
                  {expanded === t.torneoId ? "🔽 Ocultar detalles" : "🔼 Ver detalles"}
                </button>

                {expanded === t.torneoId && (
                  <div className="mt-3 border-top pt-3">
                    <p><strong>📝 Descripción:</strong> {t.descripcion}</p>
                    <p><strong>📌 Inscripción:</strong> {t.fechaInicioInscripcion} → {t.fechaFinInscripcion}</p>
                    <p><strong>🚦 Estado:</strong> {t.estado}</p>
                    <p>
                        <strong>📄 Bases:</strong>{" "}
                        <a href={`/view-pdf/${encodeURIComponent(t.basesTorneo)}`} target="_blank" rel="noopener noreferrer">
                        Ver PDF
                        </a>
                    </p>

                    <hr />
                    <h6 className="text-secondary">Subtorneos</h6>
                    {subTournamentsMap[t.torneoId] ? (
                      subTournamentsMap[t.torneoId].map((sub) => (
                        <div
                          key={sub.subTorneoId}
                          className="border rounded-3 p-2 mb-2 bg-light"
                        >
                          <p className="mb-1"><strong>🎯 Categoría:</strong> {sub.categoria}</p>
                          <p className="mb-1"><strong>🚥 Estado:</strong> {sub.estado}</p>
                          <p className="mb-0"><strong>👥 Equipos:</strong> {sub.cantidadEquipos}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">Cargando subtorneos...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentsCardList;
