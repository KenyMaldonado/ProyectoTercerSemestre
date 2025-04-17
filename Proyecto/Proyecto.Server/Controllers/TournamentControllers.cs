using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class TournamentControllers : ControllerBase
    {
        public TournamentControllers()
        {
        }


        [HttpGet("Ob")]   
        public IActionResult Ob()
        {
            return NotFound();
        }


        
    }
}
