using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    public interface ITournamentRepository
    {
        Task<List<TournamentDTO.TypeOfTournament>> GetTypesTournaments();
        void CreateNewTournament(TournamentDTO tournament);
        Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments();
    }
}
