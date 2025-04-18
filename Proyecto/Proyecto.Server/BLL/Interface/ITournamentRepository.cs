using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    public interface ITournamentRepository
    {
        Task<List<TournamentDTO.TypeOfTournament>> GetTournaments();
    }
}
