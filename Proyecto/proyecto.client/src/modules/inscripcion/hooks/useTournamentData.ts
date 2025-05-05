import { useEffect, useState } from "react";
import api from "../../../services/api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Tournament {
  id: number;
  torneoId: number;
  nameTipoTorneo: string;
  nombre: string;
}

interface TipoTorneo {
  tipoTorneoId: number;
  nombreTipoTorneo: string;
  descripcionTipoTorneo: string;
}

interface SubTorneo {
  id: number;
  nombre: string;
}

const useTournamentData = () => {
  const [types, setTypes] = useState<TipoTorneo[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [subTournaments, setSubTournaments] = useState<SubTorneo[]>([]);

  const [selectedTournament, setSelectedTournament] = useState<string | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSubTournament, setSelectedSubTournament] =
    useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, tournamentsRes] = await Promise.all([
          api.get<TipoTorneo[]>("/TournamentControllers/GetTypeTournaments"),
          api.get<ApiResponse<Tournament[]>>(
            "/TournamentControllers/GetTournaments"
          ),
        ]);

        setTypes(typesRes.data);
        setTournaments(
          Array.isArray(tournamentsRes.data.data)
            ? tournamentsRes.data.data
            : []
        );
      } catch (error) {
        console.error("Error cargando datos de torneos:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      console.log("Cargando subtorneos para:", selectedTournament);
      api
        .get<ApiResponse<SubTorneo[]>>(
          "/TournamentControllers/GetSubTournaments",
          {
            params: { TournamentID: selectedTournament },
          }
        )
        .then((res) => {
          console.log("Subtorneos cargados:", res.data.data);
          setSubTournaments(Array.isArray(res.data.data) ? res.data.data : []);
        })
        .catch((err) => {
          console.error("Error obteniendo subtorneos:", err);
        });
    }
  }, [selectedTournament]);

  return {
    tournaments,
    subTournaments,
    types,
    selectedTournament,
    setSelectedTournament,
    selectedType,
    setSelectedType,
    selectedSubTournament,
    setSelectedSubTournament,
  };
};

export default useTournamentData;
