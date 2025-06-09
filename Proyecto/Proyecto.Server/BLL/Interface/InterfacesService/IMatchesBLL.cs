using Proyecto.Server.DTOs;
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
    }
}
