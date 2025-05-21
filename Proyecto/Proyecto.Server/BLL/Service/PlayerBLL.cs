using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.BLL.Repository;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

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

        public List<JugadorDTO> GetJugadoresByTeam(int TeamId)
        {
            return _playerRepository.GetJugadoresByTeam(TeamId);
        }

        public async Task<List<JugadorDTO.PosicionJugadorDTO>> GetPosicionesJugadores()
        {
            return await _playerRepository.GetPosicionesJugadores();
        }

        public async Task<PagedResultDTO<JugadorDTO>> GetPlayers(int pagina, int tamañoPagina)
        {
            var totalJugadores = await _playerRepository.CountPlayers();

            int totalPaginas = (int)Math.Ceiling((double)totalJugadores / tamañoPagina);

            var jugadores = await _playerRepository.GetPLayers(pagina, tamañoPagina);

            return new PagedResultDTO<JugadorDTO>
            {
                Items = jugadores,
                TotalPages = totalPaginas,
                CurrentPage = pagina,
                PageSize = tamañoPagina,
                TotalItems = totalJugadores
            };
        }
    }
}
