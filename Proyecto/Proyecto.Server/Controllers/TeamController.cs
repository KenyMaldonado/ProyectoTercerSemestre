using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.Utils;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class TeamController : Controller
    {
        private readonly ITeamBLL _teamBLL;

        public TeamController(ITeamBLL teamBll)
        {
            _teamBLL = teamBll;
        }

        [HttpGet("subtorneo/{subTorneoId}/equipos")]
        public async Task<IActionResult> GetEquiposBySubtorneo(int subTorneoId, int pagina = 1, int tamañoPagina = 10)
        {
            try
            {
                var resultado = await _teamBLL.GetPagedTeamsBySubtorneo(subTorneoId, pagina, tamañoPagina);
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
