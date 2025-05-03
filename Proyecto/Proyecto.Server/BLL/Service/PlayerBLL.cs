using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Service
{
    public class PlayerBLL : IPlayerBLL
    {
        private readonly IPlayerRepository _playerRepository;
        private readonly IConfiguration _configuration;

        public PlayerBLL(IPlayerRepository playerRepository, IConfiguration configuration)
        {
            _playerRepository = playerRepository;
            _configuration = configuration;
        }

        public List<JugadorDTO.VerifyPlayers> VerificacionJugadores(List<int> carnets)
        {
            return _playerRepository.VerifyPlayers(carnets);
        }
    }
}
