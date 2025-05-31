// src/services/api.ts

const API_BASE_URL = 'http://localhost:5291/api';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken'); // o la llave que uses para guardar el token
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Obtener torneos
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
