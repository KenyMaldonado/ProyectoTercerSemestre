using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;

namespace Proyecto.Server.Controllers
{
    public class PlayersController : Controller
    {
        private readonly IPlayerBLL _playerBLL;

        public PlayersController(IPlayerBLL playerBLL)
        {
            _playerBLL = playerBLL;
        }

        [HttpPost("VerifyPlayers")]
        public IActionResult VerifyPlayersByCarne ([FromBody] List<int> listaCarnets)
        {
            var respuesta = _playerBLL.VerificacionJugadores(listaCarnets);
            return ResponseHelper.Success("Estado de los jugadores",respuesta);
        }
    }
}
