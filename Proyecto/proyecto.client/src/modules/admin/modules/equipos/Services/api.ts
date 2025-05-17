// src/services/api.ts

const API_BASE_URL = 'http://localhost:5291/api';

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

export async function getJugadoresPorEquipo(teamId: number) {
    const response = await fetch(`${API_BASE_URL}/Players/GetPlayersByTeam?TeamId=${teamId}`);
    if (!response.ok) {
        throw new Error('Error al obtener jugadores');
    }
    const data = await response.json();
    return data;  
}