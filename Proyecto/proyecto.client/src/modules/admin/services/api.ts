// src/services/api.ts

const API_BASE_URL = 'https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken'); // o la llave que uses para guardar el token
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
function getAuthHeaders2() {
  const token = localStorage.getItem('authToken'); // o la llave correcta

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Obtener torneos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTorneos = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/TournamentControllers/GetTournaments`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching torneos:', error);
        return [];
    }
};


// Obtener subtorneos por torneo ID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSubtorneos = async (torneoId: number): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/TournamentControllers/GetSubTournaments?TournamentID=${torneoId}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching subtorneos:', error);
        return [];
    }
};

// Obtener equipos por subtorneo ID con paginación
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEquipos = async (subtorneoId: number, page = 1, pageSize = 10): Promise<any> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/Team/subtorneo/${subtorneoId}/equipos?pagina=${page}&tamañoPagina=${pageSize}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching equipos:', error);
        return { items: [], totalPages: 0 };
    }
};

// Obtener jugadores por equipo ID
export async function getJugadoresPorEquipo(teamId: number) {
    try {
        const response = await fetch(`${API_BASE_URL}/Players/GetPlayersByTeam?TeamId=${teamId}`);
        if (!response.ok) {
            throw new Error('Error al obtener jugadores');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching jugadores:', error);
        return [];
    }
}

// Actualizar equipo
export const updateTeam = async (equipoId: number, nombre: string, colorUniforme: string, colorUniformeSecundario: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/UpdateTeam`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                equipoId,
                nombre,
                colorUniforme,
                colorUniformeSecundario
            })
        });

        if (!response.ok){
            const errorText = await response.text();
            throw new Error(`Error al actualizar el equipo: ${errorText}`);
        }
            

        return true;
    } catch (error) {
        console.error('Error updating team:', error);
        return false;
    }
};

// Actualizar logo del equipo
export const updateTeamLogo = async (teamId: number, file: File): Promise<boolean> => {
    try {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/team/UpdateLogoTeam?TeamId=${teamId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if (!response.ok) throw new Error('Error al actualizar el logo');

        return true;
    } catch (error) {
        console.error('Error updating team logo:', error);
        return false;
    }
};

// Obtener jugadores con paginación
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getJugadoresPaginados = async (page = 1, pageSize = 8): Promise<any> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/Players/GetPlayers?pagina=${page}&tamañoPagina=${pageSize}`, 
            {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching jugadores:', error);
        return { items: [], totalPages: 0 };
    }
};

// Buscar jugadores por nombre (o parte del nombre) - con autenticación
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchPlayers = async (query: string): Promise<any[]> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/Players/SearchPlayers?query=${encodeURIComponent(query)}`, 
            {
                method: 'GET',
                headers: getAuthHeaders(), // añade el token
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al buscar jugadores: ${errorText}`);
        }

        const data = await response.json();
        return data; // o data.data si tu API devuelve así
    } catch (error) {
        console.error('Error searching players:', error);
        return [];
    }
};

// src/api.ts

export interface Inscripcion {
  inscripcionId: number;
  preInscripcionId: number;
  codigo: string;
  equipoId: number;
  nombreEquipo: string;
  estado: string;
  fechaInscripcion: string;
  subTorneoId: number;
  descripcion: string;
  nombreCapitan: string;
  correoCapitan: string;
}

export const obtenerInscripciones = async (): Promise<Inscripcion[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/TeamManagementControllers/GetInscripciones`);
    const json = await response.json();

    if (json.success) {
      return json.data;
    } else {
      console.error('Error en respuesta:', json.message);
      return [];
    }
  } catch (error) {
    console.error('Error en fetch:', error);
    return [];
  }
};

export type EstadoInscripcionUpdate = 'Aprobada' | 'Rechazada' | 'EnCorreccion';

export const updateEstadoInscripcion = async (
  inscripcionID: number,
  estado: EstadoInscripcionUpdate, // TypeScript ya la encontrará aquí
  comentario: string = ''
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/TeamManagementControllers/UpdateEstadoInscripcion`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        inscripcionID,
        estado,
        comentario
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error al actualizar estado de inscripción: ${response.status} - ${errorBody}`);
      throw new Error(`Error al actualizar estado de inscripción: ${errorBody}`);
    }

    return true;

  } catch (error) {
    console.error('Error en updateEstadoInscripcion:', error);
    return false;
  }
};

// Obtener tabla de posiciones por SubTorneoId
export interface TablaPosiciones {
  equipoId: number;
  nombreEquipo: string;
  urlImagenEquipo : string
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
}


export const getTablaPosiciones = async (subTorneoId: number): Promise<TablaPosiciones[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/MatchesControllers/tabla-posiciones/${subTorneoId}`);
    const json = await response.json();

    if (json.success) {
      return json.data;
    } else {
      console.error('Error en respuesta de tabla de posiciones:', json.message);
      return [];
    }
  } catch (error) {
    console.error('Error en fetch de tabla de posiciones:', error);
    return [];
  }
};

export interface Gol {
  minutoGol: number;
  ordenPenal: number;
  resultadoPartidoId: number;
  jugadorId: number;
  tipoGolId: number;
}

export interface Tarjeta {
  minutoTarjeta: number;
  descripcion: string;
  estado: string;
  tipoTarjeta: string;
  resultadoPartidoId: number;
  jugadorId: number;
}

export interface RegistrarResultadosPayload {
  partidoID: number;
  golesPartido: Gol[];
  tarjetasPartido: Tarjeta[];
}

export const registrarResultados = async (
  payload: RegistrarResultadosPayload
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/MatchesControllers/registrar-resultados`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload), // El payload ya contiene partidoID
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error registrando resultados:', error);
    return false;
  }
};

// Interfaces para el tipo de dato que devuelve el endpoint
interface EquipoResumen {
  equipoId: number;
  nombre: string;
  nameFacultad: string;
  imagenEquipo: string;
}

export interface PartidoResumen {
  partidoId: number;
  fechaPartido: string; // ISO date string
  horaPartido: string;
  equipo1: EquipoResumen;
  equipo2: EquipoResumen;
  estado: string;
  jornada: number;
  faseId: number;
  nameArbitro: string;
  nameCancha: string;
}

export interface JornadaPartidos {
  numeroJornada: number;
  partidos: PartidoResumen[];
}

// Método para obtener partidos por jornada dado un subTorneoId
export const getPartidosPorJornada = async (subTorneoId: number): Promise<JornadaPartidos[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/MatchesControllers/subtorneo/${subTorneoId}/partidosPorJornada`, {
      method: 'GET',
      headers: getAuthHeaders2(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Asumiendo que el API responde directamente el array sin wrapper { success, data }
    // si no es así, ajustar data = data.data o similar

    return data as JornadaPartidos[];

  } catch (error) {
    console.error('Error fetching partidos por jornada:', error);
    return [];
  }
};

// api.ts

export interface UpdateArbitroInput {
  arbitroId: number;
  partidoId: number;
}

export const updateArbitroPartido = async (input: UpdateArbitroInput): Promise<{ success: boolean; message?: string }> => {
  try {
    const { arbitroId, partidoId } = input;

    const url = `${API_BASE_URL}/MatchesControllers/UpdateArbitroPartido?ArbitroID=${arbitroId}&PartidoID=${partidoId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(), // Asegúrate que esto incluye 'Content-Type': 'application/json' si es necesario
    });

    if (response.ok) {
      if (response.status === 204) {
        return { success: true, message: "Árbitro asignado correctamente." };
      } else {
        const data = await response.json();
        return data;
      }
    } else {
      let errorMessage = `Error HTTP! Estado: ${response.status}.`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage += ` ${JSON.stringify(errorData)}`;
        }
      } catch {
        const rawErrorText = await response.text();
        errorMessage += ` ${rawErrorText}`;
      }
      return { success: false, message: errorMessage };
    }
  } catch (error: any) {
    console.error('Error al actualizar árbitro del partido:', error);
    return { success: false, message: error.message || 'Error de conexión o servidor desconocido.' };
  }
};


export interface Arbitro {
  usuarioId: number;
  nombre: string;
  apellido: string;
}

export const getArbitros = async (): Promise<Arbitro[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/TeamManagementControllers/GetArbitros`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Si la respuesta es { success, message, data }, entonces extraemos "data"
    return result.data as Arbitro[];
  } catch (error) {
    console.error('Error al obtener árbitros:', error);
    return [];
  }
};

export interface GolDTO {
  minutoGol: number;
  esTiempoExtra: boolean;
  ordenPenal: number | null;
  jugadorNombre: string;
  tipoGol: string;
  imagenJugador?: string; // Puede venir nulo
}

export interface TarjetaDTO {
  minutoTarjeta: number;
  tipoTarjeta: string;
  descripcion?: string;
  jugadorNombre: string;
}

export interface PartidoDetalladoDTO {
  partidoId: number;
  fechaPartido: string; // ISO 8601
  horaPartido: string;  // HH:mm:ss
  estado: string;

  equipo1Nombre: string;
  equipo2Nombre: string;

  golesEquipo1: number;
  golesEquipo2: number;

  goles: GolDTO[];
  tarjetas: TarjetaDTO[];
}
export const getResultadosPartidos = async (subTorneoId: number): Promise<PartidoDetalladoDTO[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/MatchesControllers/resultadoPartidos?subTorneoId=${subTorneoId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    return json.data as PartidoDetalladoDTO[];

  } catch (error) {
    console.error('Error fetching resultados de partidos:', error);
    return [];
  }
};
