import { useEffect, useState, useCallback } from "react"; // ¡Importa useCallback!
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

  // Memoizar fetchTorneos
  const fetchTorneos = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }, []); // Dependencias vacías porque no depende de ningún estado o prop del hook

  // Memoizar fetchSubTorneos
  const fetchSubTorneos = useCallback(async (torneoId: number) => {
    // Agregamos una verificación aquí para evitar llamadas si ya se cargó para este torneoId
    if (subTournamentsMap[torneoId]) {
        console.log(`Subtorneos para ${torneoId} ya cargados. Evitando llamada duplicada.`);
        return;
    }
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
  }, [subTournamentsMap]); // Depende de subTournamentsMap para asegurar que la verificación `subTournamentsMap[torneoId]` sea actual.

  // Memoizar fetchTiposTorneo
  const fetchTiposTorneo = useCallback(async () => {
    try {
      const res = await api.get<TipoTorneo[]>("/TournamentControllers/GetTypeTournaments");
      setTiposTorneo(res.data);

    } catch (err) {
      console.error("Error al obtener tipos de torneo:", err);
    }
  }, []); // Dependencias vacías

  // El useEffect aquí en el custom hook sigue estando bien si solo quieres cargar torneos al inicio
  useEffect(() => {
    fetchTorneos();
  }, [fetchTorneos]); // Ahora fetchTorneos está memoizada, así que esta dependencia es estable.

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