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
        Task<List<MatchesDTO.GetPartidosByJornadaDTO>> GetPartidosBySubtorneo(int subtorneoID, int rol, int usuarioID);
        Task UpdateEstadoSubtorneo(int subtorneoID);
        Task<List<TablaPosicionesDto>> ObtenerTablaPosicionesAsync(int subTorneoId);
        Task AsignarArbitroAsync(int idArbitro, int partidoId);
        Task<bool> RegistrarResultadosAsync(ResultadosPartido dto);
        Task<List<ResultadoDTO.PartidoDetalladoDTO>> GetResultadosDetalladosPartidosBySubtorneo(int subtorneoId);
    }
}
