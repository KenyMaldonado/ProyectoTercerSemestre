using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;
using Proyecto.Server.Utils;
using static Proyecto.Server.DTOs.MatchesDTO;
using static Proyecto.Server.DTOs.TournamentDTO;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class MatchesControllers : Controller
    {
        private readonly IMatchesBLL _matchesBLL;
        private readonly AzureBlobService _blobService;
        public MatchesControllers(IMatchesBLL matchesBLL, AzureBlobService blobService)
        {
            _matchesBLL = matchesBLL;
            _blobService = blobService;
        }


        [HttpGet("GetCanchas")]
        public async Task<IActionResult> GetCanchas()
        {
            try
            {
                var listado = await _matchesBLL.GetCanchas();
                return ResponseHelper.Success("Listado de canchas actuales", listado);
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

        [Authorize(Roles = "Admin")]
        [HttpDelete("DeleteCancha")]
        public async Task<IActionResult> DeleteCancha(int canchaID)
        {
            try
            {
                await _matchesBLL.DeleteCancha(canchaID);
                return NoContent();
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

        [Authorize(Roles = "Admin")]
        [HttpPatch("UpdateCancha")]
        public async Task<IActionResult> UpdateCancha([FromBody] MatchesDTO.CanchaDTO datos)
        {
            try
            {
                await _matchesBLL.UpdateCancha(datos);
                return NoContent();
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

        [Authorize(Roles = "Admin")]
        [HttpPost("CreateCancha")]
        public async Task<IActionResult> CreateCancha([FromBody] MatchesDTO.CanchaDTO datos)
        {
            try
            {
                await _matchesBLL.CreateCancha(datos);
                return ResponseHelper.Created("La cancha ha sido creada exitosamente");
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


        /// <summary>
        /// Inicia un torneo en formato "todos contra todos", generando sus jornadas y partidos.
        /// Requiere rol de Administrador.
        /// </summary>
        /// <param name="request">Datos para iniciar el torneo, incluyendo ID del subtorneo, equipos, días y horarios.</param>
        /// <returns>Mensaje de éxito o error con detalles.</returns>
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost("IniciarTodosContraTodos")]
        public async Task<IActionResult> IniciarTodosContraTodos([FromBody] TournamentDTO.StartTournamentRequest request)
        {
            if (request == null)
                return BadRequest("Datos del torneo no proporcionados.");

            try
            {
                await _matchesBLL.IniciarTorneoTodosContraTodosAsync(request);
                await _matchesBLL.UpdateEstadoSubtorneo(request.SubtorneoId);
                return Ok(new { mensaje = "Torneo iniciado correctamente con el formato todos contra todos." });
            }
            catch (CustomException ex) // ¡Cambio aquí! Ahora captura CustomException
            {
                // Captura las excepciones personalizadas con mensajes específicos
                return BadRequest(new { error = ex.Message }); // Puedes usar ex.StatusCode si CustomException lo expone
            }
            catch (Exception ex)
            {
                // Para errores inesperados no controlados por CustomException
                return StatusCode(500, new { error = "Ocurrió un error inesperado al iniciar el torneo.", detalle = ex.Message });
            }
        }


        /// <summary>
        /// Obtiene todos los partidos de un subtorneo específico, agrupados por jornada.
        /// </summary>
        /// <param name="subtorneoID">El ID del subtorneo del que se quieren obtener los partidos.</param>
        /// <returns>Una lista de jornadas, cada una conteniendo sus partidos y detalles.</returns>
        [HttpGet("subtorneo/{subtorneoID}/partidosPorJornada")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<MatchesDTO.GetPartidosByJornadaDTO>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPartidosBySubtorneo(int subtorneoID)
        {
            try
            {
                var partidosPorJornada = await _matchesBLL.GetPartidosBySubtorneo(subtorneoID);

                if (partidosPorJornada == null || !partidosPorJornada.Any())
                {
                    return NotFound(new { mensaje = $"No se encontraron partidos para el subtorneo ID {subtorneoID}." });
                }

                return Ok(partidosPorJornada);
            }
            catch (CustomException ex) // ¡Cambio aquí! Ahora captura CustomException
            {
                // Captura las excepciones personalizadas con mensajes específicos
                return BadRequest(new { error = ex.Message }); // Puedes usar ex.StatusCode si CustomException lo expone
            }
            catch (Exception ex)
            {
                // Para errores inesperados no controlados por CustomException
                return StatusCode(500, new { error = "Ocurrió un error inesperado al iniciar el torneo.", detalle = ex.Message });
            }
        }


        [HttpGet("tabla-posiciones/{subTorneoId}")]
        public async Task<IActionResult> GetTablaPosiciones(int subTorneoId)
        {
            try
            {
                var resultado = await _matchesBLL.ObtenerTablaPosicionesAsync(subTorneoId);
                return ResponseHelper.Success("tabla de posiciones:", resultado);
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
