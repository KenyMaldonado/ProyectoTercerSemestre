﻿using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using static Proyecto.Server.DTOs.MatchesDTO;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface IMatchesRepository
    {
        Task<List<MatchesDTO.CanchaDTO>> GetCanchas();
        Task UpdateCancha(MatchesDTO.CanchaDTO datos);
        Task CreateCancha(MatchesDTO.CanchaDTO datos);
        Task DeleteCancha(int canchaID);
        Task<Torneo?> GetTorneoBySubtorneoAsync(int subtorneoId);
        Task<List<Cancha>> GetCanchasDisponiblesAsync();
        Task<List<Usuario>> GetArbitrosDisponiblesAsync(DateTime fecha, TimeOnly hora);
        Task<bool> IsCanchaDisponibleAsync(int canchaId, DateTime fecha, TimeOnly hora);
        Task CrearJornadaAsync(Jornada jornada);
        Task CrearPartidoAsync(Partido partido);
        Task GuardarCambiosAsync();
        Task<List<Usuario>> GetArbitrosDisponiblesGeneralAsync(); // Nuevo método
        Task<bool> IsArbitroOcupadoAsync(int arbitroId, DateTime fecha, TimeOnly hora);
        Task<List<Partido>> GetPartidosProgramadosEnRangoAsync(DateTime fechaInicio, DateTime fechaFin);
        Task CrearJornadasYPartidosAsync(List<Jornada> jornadas, List<Partido> partidos);
        Task<List<Jornada>> GetJornadasWithPartidosAndDetailsBySubtorneoAsync(int subtorneoId, int rol, int usuarioId);
        Task UpdateEstadoSubtorneo(int subtorneoID);
        Task<List<TablaPosicionesDto>> ObtenerTablaPosicionesAsync(int subTorneoId);
        Task<bool> AsignarArbitroPartido(int idArbitro, int partidoId);

        Task<ResultadoPartido> CrearResultadoPartidoAsync(ResultadoPartido resultado);
        Task AgregarGolesAsync(List<Goles> goles);
        Task AgregarTarjetasAsync(List<Tarjeta> tarjetas);
        Task<Jugador?> ObtenerJugadorPorIdAsync(int jugadorId);
        Task ActualizarEstadoJugadorAsync(int jugadorId, Jugador.EstadoJugador nuevoEstado);
        Task ActualizarGolesResultadoAsync(int resultadoId, int golesEq1, int golesEq2);
        Task<Partido?> ObtenerPartidoConJugadoresAsync(int resultadoId);
        Task<int?> ObtenerEquipoDeJugadorAsync(int jugadorId);
        Task ActualizarEstadoPartido(int partidoID);
        Task<List<ResultadoDTO.PartidoDetalladoDTO>> GetResultadosDetalladosPartidosBySubtorneo(int subtorneoId);
    }
}
