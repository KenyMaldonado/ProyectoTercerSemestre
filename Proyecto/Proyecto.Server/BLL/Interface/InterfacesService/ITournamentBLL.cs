using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface ITournamentBLL
    {
        Task<List<TournamentDTO.TypeOfTournament>> GetTypeOfTournaments();
        void CreateTournament(TournamentDTO.CreateTournamenteParameter parametros, int UsuarioCreo);
        Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments();
        Task<List<TournamentDTO.GetSubTournamentDTO>> GetSubTournaments(int TournamentID);
    }
}
