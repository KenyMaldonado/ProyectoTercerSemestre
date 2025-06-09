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

    }
}
