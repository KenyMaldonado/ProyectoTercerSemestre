using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    public interface ITournamentBLL
    {
        Task<List<TournamentDTO.TypeOfTournament>> GetTypeOfTournaments();
        void CreateTournament(TournamentDTO.CreateTournamenteParameter parametros, int UsuarioCreo);
        public Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments();
    }
}
