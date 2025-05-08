using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
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
            return _torneoRepositorio.GetTypesTournaments();
        }

        public void CreateTournament(TournamentDTO.CreateTournamenteParameter parametros, int UsuarioCreo)
        {
            TournamentDTO Torneo = new TournamentDTO();
            Torneo.Datos = parametros;
            Torneo.UsuarioId = UsuarioCreo;
            _torneoRepositorio.CreateNewTournament(Torneo);
        }

        public Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments()
        {
            return _torneoRepositorio.GetTournaments();
        }

        public Task<List<TournamentDTO.GetSubTournamentDTO>> GetSubTournaments(int TournamentID)
        {
            return _torneoRepositorio.GetSubTournaments(TournamentID);
        }

        public Task<List<TournamentDTO.TournamentGameTypes>> GetTiposJuego()
        {
            return _torneoRepositorio.GetTournamentGameTypes();
        }
    }
}
