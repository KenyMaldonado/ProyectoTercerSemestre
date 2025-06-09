// services/tournamentService.ts

// Define tu URL base de la API aquí, o impórtala si está en otro archivo de configuración
const API_BASE_URL = 'https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api'; // Asegúrate de que esta sea la URL correcta de tu API

function getAuthHeaders() {
  const token = localStorage.getItem('authToken'); // o la llave que uses para guardar el token
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// --- Interfaces Actualizadas ---
// Interfaz para los días de partido
export interface DiaPartido {
  dia: string; // Por ejemplo, "Lunes"
  horarios: string[]; // Por ejemplo, ["18:00", "20:00"]
}

// Interfaz para el payload de IniciarTodosContraTodos
export interface IniciarTodosContraTodosPayload {
  subtorneoId: number;
  equiposId: number[];
  diasPartidos: DiaPartido[];
  diasOmitidos: string[]; // Formato "YYYY-MM-DD"
}

export interface Torneo {
    torneoId: number;
    nombre: string;
    fechaInicio: string; // La API devuelve como string "YYYY-MM-DD"
    fechaFin: string;   // La API devuelve como string "YYYY-MM-DD"
    descripcion: string;
    basesTorneo: string;
    fechaInicioInscripcion: string;
    fechaFinInscripcion: string;
    usuarioId: number;
    nameUsuario: string;
    tipoTorneoId: number;
    nameTipoTorneo: string; // <-- ESTO ES EL "TIPO DE TORNEO" QUE NECESITAS
    estado: string;
    tipoJuegoId: number;
    nameTipoJuego: string;
    nameUserModify: string;
    userModifyId: number;
    fechaModificacion: string;
}

export interface Subtorneo {
    subTorneoId: number;
    categoria: string;
    torneoId: number;
    estado: string; // Para saber a qué torneo pertenece
    // Agrega cualquier otra propiedad que venga de tu API para un Subtorneo
    // (Asegúrate de revisar la respuesta de tu API para subtorneos y añadir si falta algo)
}

export interface EquipoSubtorneo {
    equipoId: number;
    nombre: string;
    colorUniforme: string;
    colorUniformeSecundario: string;
    facultadId: number;
    nameFacultad: string | null;
    imagenEquipo: string | null;
    estado: string;
}

// --- Funciones de API para Torneos (no necesitan cambios, ya están bien) ---

export const getTorneos = async (): Promise<Torneo[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/TournamentControllers/GetTournaments`);
        const data = await response.json();
        if (data.success) {
            return data.data;
        } else {
            console.error('Error en respuesta al obtener torneos:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching torneos:', error);
        return [];
    }
};

export const getSubtorneos = async (torneoId: number): Promise<Subtorneo[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/TournamentControllers/GetSubTournaments?TournamentID=${torneoId}`);
        const data = await response.json();
        if (data.success) {
            return data.data;
        } else {
            console.error('Error en respuesta al obtener subtorneos:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching subtorneos:', error);
        return [];
    }
};

export const getEquiposPorSubtorneo = async (subTorneoId: number): Promise<EquipoSubtorneo[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/Team/GetTeamsBySubtournaments?subTorneoId=${subTorneoId}`);
        const json = await response.json();

        if (json.success) {
            return json.data;
        } else {
            console.error('Error en respuesta al obtener equipos por subtorneo:', json.message);
            return [];
        }
    } catch (error) {
        console.error('Error en fetch al obtener equipos por subtorneo:', error);
        return [];
    }
};


/**
 * Inicia el proceso de "Todos Contra Todos" para un subtorneo.
 * @param payload Objeto con los datos necesarios para iniciar el torneo.
 * @returns {Promise<boolean>} True si la operación fue exitosa, false en caso contrario.
 */
export const iniciarTodosContraTodos = async (payload: IniciarTodosContraTodosPayload): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/MatchesControllers/IniciarTodosContraTodos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error al iniciar el torneo 'Todos Contra Todos': ${response.status} - ${errorText}`);
      throw new Error(`Error al iniciar el torneo 'Todos Contra Todos': ${errorText}`);
    }

    // Si la API devuelve algún dato útil, podrías parsearlo y retornarlo.
    // Para este caso, solo verificamos que la respuesta sea OK.
    return true;
  } catch (error) {
    console.error('Error en iniciarTodosContraTodos:', error);
    return false;
  }
};
