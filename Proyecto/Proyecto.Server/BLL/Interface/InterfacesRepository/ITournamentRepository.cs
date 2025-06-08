using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface ITournamentRepository
    {
        Task<List<TournamentDTO.TypeOfTournament>> GetTypesTournaments();
        Task CreateNewTournament(TournamentDTO.CreateTournamenteParameter tournament);
        Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments();
        Task<List<TournamentDTO.GetSubTournamentDTO>> GetSubTournaments(int TournamentID);
        Task<List<TournamentDTO.TournamentGameTypes>> GetTournamentGameTypes();
        Task<int> GetLastIDTournaments();
        void UpdateLinkBasesTorneo(int torneoId, string linkNuevo);
        Task UpdateTournament(TournamentDTO.UpdateTournamentDTO torneoModify, int usuarioModificoId);



    }
}
