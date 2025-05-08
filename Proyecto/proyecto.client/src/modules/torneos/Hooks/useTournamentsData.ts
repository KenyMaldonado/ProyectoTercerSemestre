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
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  basesTorneo: string;
  fechaInicioInscripcion: string;
  fechaFinInscripcion: string;
  usuarioId: number;
  nameUsuario: string;
  tipoTorneoId: number;
  nameTipoTorneo: string;
  estado: string;
  tipoJuegoId: number;
  nameTipoJuego: string;
}

export interface SubTorneo {
  subTorneoId: number;
  categoria: string;
  torneoId: number;
  estado: string;
  cantidadEquipos: number;
}

interface TipoTorneo {
  tipoTorneoId: number;
  nombreTipoTorneo: string;
  descripcionTipoTorneo: string;
}

const useTournamentData = () => {
  const [types, setTypes] = useState<TipoTorneo[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [subTournamentsMap, setSubTournamentsMap] = useState<Record<number, SubTorneo[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, tournamentsRes] = await Promise.all([
          api.get<ApiResponse<TipoTorneo[]>>("/TournamentControllers/GetTypeTournaments"),
          api.get<ApiResponse<Tournament[]>>("/TournamentControllers/GetTournaments"),
        ]);
        setTypes(typesRes.data.data || []);
        setTournaments(tournamentsRes.data.data || []);
      } catch (error) {
        console.error("Error cargando datos de torneos:", error);
      }
    };
    fetchData();
  }, []);

  const fetchSubTorneos = async (torneoId: number) => {
    try {
      const res = await api.get<ApiResponse<SubTorneo[]>>("/TournamentControllers/GetSubTournaments", {
        params: { TournamentID: torneoId },
      });
      setSubTournamentsMap((prev) => ({
        ...prev,
        [torneoId]: res.data.data || [],
      }));
    } catch (err) {
      console.error("Error obteniendo subtorneos:", err);
    }
  };

  return {
    types,
    tournaments,
    subTournamentsMap,
    fetchSubTorneos,
  };
};

export default useTournamentData;
