using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface;

namespace Proyecto.Server.Controllers
{
    /// <summary>
    /// Controlador responsable de manejo de los torneos y subtorneos
    /// </summary>
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class TournamentControllers : ControllerBase
    {
        private readonly ITournamentBLL tournamentBLL;
        /// <summary>
        /// Contructor
        /// </summary>
        public TournamentControllers(ITournamentBLL tournamentBLL)
        {
            this.tournamentBLL = tournamentBLL;
        }

        [HttpGet("GetTournaments")]
        public async Task<IActionResult> GetTournaments()
        {
            try
            {
                var result = await tournamentBLL.GetTypeOfTournaments();

                if (result == null || !result.Any())
                {
                    return NotFound("No hay tipos de torneos disponibles.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }





    }
}
