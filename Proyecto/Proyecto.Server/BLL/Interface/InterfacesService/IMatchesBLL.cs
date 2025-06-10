using Proyecto.Server.DTOs;
using static Proyecto.Server.DTOs.MatchesDTO;
using static Proyecto.Server.DTOs.TournamentDTO;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface IMatchesBLL
    {
        Task<List<MatchesDTO.CanchaDTO>> GetCanchas();
        Task UpdateCancha(MatchesDTO.CanchaDTO datos);
        Task DeleteCancha(int CanchaID);
        Task CreateCancha(MatchesDTO.CanchaDTO datosNuevos);
        Task IniciarTorneoTodosContraTodosAsync(TournamentDTO.StartTournamentRequest request);
        Task<List<MatchesDTO.GetPartidosByJornadaDTO>> GetPartidosBySubtorneo(int subtorneoID);
        Task UpdateEstadoSubtorneo(int subtorneoID);
        Task<List<TablaPosicionesDto>> ObtenerTablaPosicionesAsync(int subTorneoId);
    }
}
