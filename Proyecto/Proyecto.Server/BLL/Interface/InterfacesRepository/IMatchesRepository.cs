using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

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
        Task<List<Jornada>> GetJornadasWithPartidosAndDetailsBySubtorneoAsync(int subtorneoId);
        Task UpdateEstadoSubtorneo(int subtorneoID);
    }
}
