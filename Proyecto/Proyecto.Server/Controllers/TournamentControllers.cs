using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;
using Proyecto.Server.Utils;

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

        /// <summary>
        /// Obtiene los tipos de torneos
        /// </summary>
        /// <returns></returns>
        
        [HttpGet("GetTypeTournaments")]
        public async Task<IActionResult> GetTypeTournaments()
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


        /// <summary>
        /// Crea un nuevo torneo incluyendo las ramas que desea habilitar el administrador. Necesita Autenticación 
        /// </summary>
        /// <returns></returns>
        [Authorize(Roles = "1")]
        [HttpPost("CreateNewTournament")]
        public IActionResult CreateNewTournament(TournamentDTO.CreateTournamenteParameter parametrosPeticion)
        {
            try
            {
                var UsuarioId = User.GetUsuarioId();

                if (UsuarioId == null)
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No se obtuvo el ID del usuario", 401));
                }

                tournamentBLL.CreateTournament(parametrosPeticion, UsuarioId.Value);
                return ResponseHelper.Created("Torneo creado exitosamente");
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

        [HttpGet("GetTournaments")]
        public async Task<IActionResult> GetTournaments()
        {
            try
            {
                var result = await tournamentBLL.GetTournaments();

                return ResponseHelper.Success("Torneos Actuales", result);
            }
            catch(CustomException ex)
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
