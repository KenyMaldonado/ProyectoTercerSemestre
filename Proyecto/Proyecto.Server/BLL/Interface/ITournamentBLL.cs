using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    public interface ITournamentBLL
    {
        Task<List<TournamentDTO.TypeOfTournament>> GetTypeOfTournaments();
    }
}
