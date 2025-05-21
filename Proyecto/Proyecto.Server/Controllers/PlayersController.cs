using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.BLL.Service;
using Proyecto.Server.Utils;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
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


        [HttpGet("GetPlayersByTeam")]
        public IActionResult GetPlayersByTeam(int TeamId)
        {
            var respuesta = _playerBLL.GetJugadoresByTeam(TeamId);
            return ResponseHelper.Success("Estado de los jugadores", respuesta);
        }

        [HttpGet("GetPosicionesJugadores")]
        public async Task <IActionResult> GetPosicionesJugadores()
        {
            try
            {
                var ListaPosiciones = await _playerBLL.GetPosicionesJugadores();
                return ResponseHelper.Success("Posiciones de los jugadores", ListaPosiciones);
            }
            catch (CustomException ex)
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            catch (Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }
        }

        [HttpGet("GetPlayers")]
        public async Task<IActionResult> GetPlayers(int pagina = 1, int tamañoPagina = 10)
        {
            try
            {
                var resultado = await _playerBLL.GetPlayers(pagina, tamañoPagina);
                return Ok(resultado);
            }
            catch (CustomException ex)
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            catch (Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }


        }

    }
}
