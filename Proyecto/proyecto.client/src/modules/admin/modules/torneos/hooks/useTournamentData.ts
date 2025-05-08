import { useEffect, useState } from 'react';

export interface Tournament {
  torneoId: number;
  nombre: string;
  descripcion: string;
  basesTorneo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaInicioInscripcion: string;
  fechaFinInscripcion: string;
  cantidadParticipantes: number;
  tipoTorneoID: number;
  nameTipoTorneo: string;
  nameTipoJuego: string;
  creadoPor: string;
  estado: string;
}

export interface SubTorneo {
  subTorneoId: number;
  categoria: string;
  estado: string;
  cantidadEquipos: number;
}

const useTournamentData = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [subTournamentsMap, setSubTournamentsMap] = useState<{
    [key: number]: SubTorneo[];
  }>({});

  const fetchTorneos = async () => {
    try {
      const response = await fetch('http://localhost:5291/api/TournamentControllers/GetTorneos');
      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      } else {
        console.error('Error al obtener torneos');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const fetchSubTorneos = async (torneoId: number) => {
    try {
      const response = await fetch(`http://localhost:5291/api/SubTorneoControllers/GetByTorneo/${torneoId}`);
      if (response.ok) {
        const data = await response.json();
        setSubTournamentsMap((prev) => ({
          ...prev,
          [torneoId]: data
        }));
      } else {
        console.error('Error al obtener subtorneos');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  useEffect(() => {
    fetchTorneos();
  }, []);

  return {
    tournaments,
    subTournamentsMap,
    fetchTorneos,
    fetchSubTorneos,
  };
};

export default useTournamentData;