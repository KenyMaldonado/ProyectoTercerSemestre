using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface ITournamentBLL
    {
        Task<List<TournamentDTO.TypeOfTournament>> GetTypeOfTournaments();
        Task CreateTournament(TournamentDTO.CreateTournamenteParameter parametros, int UsuarioCreo);
        Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments();
        Task<List<TournamentDTO.GetSubTournamentDTO>> GetSubTournaments(int TournamentID);
        Task<List<TournamentDTO.TournamentGameTypes>> GetTiposJuego();
        Task<int> GetLastIDTournament();
    }
}
