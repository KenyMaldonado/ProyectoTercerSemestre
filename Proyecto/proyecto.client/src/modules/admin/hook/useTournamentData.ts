import { useEffect, useState } from "react";
import api from "../../../services/api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Tournament {
  torneoId: number;
  nombre: string;
  nameTipoTorneo: string;
  nameTipoJuego: string;
  fechaInicio: string;
  fechaFin: string;
  fechaInicioInscripcion: string;
  fechaFinInscripcion: string;
  descripcion: string;
  basesTorneo: string;
  estado: string;
  creadoPor: string;
  cantidadParticipantes: number;
  ramas: string;
}

export interface SubTorneo {
  subTorneoId: number;
  categoria: string;
  estado: string;
  cantidadEquipos: number;
}

export interface TipoTorneo {
  tipoTorneoId: number;
  nombreTipoTorneo: string;
  descripcionTipoTorneo: string;
}

const useTournamentData = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [subTournamentsMap, setSubTournamentsMap] = useState<{ [key: number]: SubTorneo[] }>({});
  const [tiposTorneo, setTiposTorneo] = useState<TipoTorneo[]>([]);

  const fetchTorneos = async () => {
    try {
      const res = await api.get<ApiResponse<any[]>>("/TournamentControllers/GetTournaments");

      if (res.data.success) {
        const torneosAdaptados: Tournament[] = res.data.data.map((t) => ({
          torneoId: t.torneoId,
          nombre: t.nombre,
          nameTipoTorneo: t.nameTipoTorneo,
          nameTipoJuego: t.nameTipoJuego,
          fechaInicio: t.fechaInicio,
          fechaFin: t.fechaFin,
          fechaInicioInscripcion: t.fechaInicioInscripcion,
          fechaFinInscripcion: t.fechaFinInscripcion,
          descripcion: t.descripcion,
          basesTorneo: t.basesTorneo,
          estado: t.estado,
          creadoPor: t.nameUsuario,
          cantidadParticipantes: t.cantidadParticipantes,
          ramas: t.ramas
        }));

        setTournaments(torneosAdaptados);
      }
    } catch (err) {
      console.error("Error al obtener torneos:", err);
    }
  };

  const fetchSubTorneos = async (torneoId: number) => {
    try {
      const res = await api.get<ApiResponse<SubTorneo[]>>("/TournamentControllers/GetSubTournaments", {
        params: { TournamentID: torneoId },
      });

      if (res.data.success) {
        setSubTournamentsMap((prev) => ({
          ...prev,
          [torneoId]: res.data.data,
        }));
      }
    } catch (err) {
      console.error("Error al obtener subtorneos:", err);
    }
  };

  const fetchTiposTorneo = async () => {
    try {
      const res = await api.get<TipoTorneo[]>("/TournamentControllers/GetTypeTournaments");
      setTiposTorneo(res.data);

    } catch (err) {
      console.error("Error al obtener tipos de torneo:", err);
    }
  };

  useEffect(() => {
    fetchTorneos();
  }, []);

  return {
    tournaments,
    subTournamentsMap,
    tiposTorneo,
    fetchTorneos,
    fetchSubTorneos,
    fetchTiposTorneo,
  };
};

export default useTournamentData;


