// Define tu URL base de la API aquí, o impórtala si está en otro archivo de configuración
const API_BASE_URL = 'http://localhost:5291/api'; // Asegúrate de que esta sea la URL correcta de tu API

// --- Interfaces ---
export interface Torneo {
    torneoId: number;
    nombre: string;
    descripcion: string;
    // Agrega cualquier otra propiedad que venga de tu API para un Torneo
}

export interface Subtorneo {
    subTorneoId: number;
    categoria: string;
    torneoId: number; // Para saber a qué torneo pertenece
    // Agrega cualquier otra propiedad que venga de tu API para un Subtorneo
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

// --- Funciones de API para Torneos ---

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