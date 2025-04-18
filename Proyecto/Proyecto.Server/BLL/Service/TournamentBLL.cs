using Proyecto.Server.BLL.Interface;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Service
{
    public class TournamentBLL : ITournamentBLL
    {
        private readonly ITournamentRepository _torneoRepositorio;
        private readonly IConfiguration _configuration;

        public TournamentBLL(ITournamentRepository torneoRepositorio, IConfiguration configuration)
        {
            _torneoRepositorio = torneoRepositorio;
            _configuration = configuration;
        }


        public Task<List<TournamentDTO.TypeOfTournament>> GetTypeOfTournaments()
        {
            return _torneoRepositorio.GetTournaments();
        }
    }
}
