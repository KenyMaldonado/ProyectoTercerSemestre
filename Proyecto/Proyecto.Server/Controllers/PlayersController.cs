using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.BLL.Service;
using Proyecto.Server.DTOs;
using Proyecto.Server.Utils;
using System.Diagnostics.CodeAnalysis;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class PlayersController : Controller
    {
        private readonly IPlayerBLL _playerBLL;
        private readonly AzureBlobService _blobService;
        public PlayersController(IPlayerBLL playerBLL, AzureBlobService blobService)
        {
            _playerBLL = playerBLL;
            _blobService = blobService;
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

        [Authorize(Roles = "Admin")]
        [HttpPut("UpdatePlayer/{id}")]
        public async Task<IActionResult> UpdatePlayer(
        [FromRoute] int id,
        [FromForm] JugadorDTO.UpdateJugadorDTO datosNuevos,
        IFormFile? file)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                string? fileUrl = null;

                if (file != null && file.Length > 0)
                {
                    // Verifica si es el archivo de "borrar"
                    if (file.FileName == "borrar.txt")
                    {
                        using var reader = new StreamReader(file.OpenReadStream());
                        var contenido = await reader.ReadToEndAsync();

                        if (contenido.Trim().ToLower() == "borrar")
                        {
                            fileUrl = "borrar";
                        }
                    }
                    else
                    {
                        // Validaciones
                        long maxFileSize = 5 * 1024 * 1024;
                        if (file.Length > maxFileSize)
                        {
                            return ResponseHelper.HandleCustomException(
                                new CustomException("El archivo supera el límite de 5 MB.", 413));
                        }

                        string[] validImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                        string extension = Path.GetExtension(file.FileName).ToLower();

                        if (!validImageExtensions.Contains(extension))
                        {
                            return ResponseHelper.HandleCustomException(
                                new CustomException("Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF, BMP, WEBP).", 415));
                        }

                        // ✅ Usa directamente el stream del archivo
                        using var stream = file.OpenReadStream();
                        string fileName = $"{id}{extension}"; // Usa la extensión real del archivo
                        fileUrl = await _blobService.UploadImagePlayerAsync(stream, fileName);

                        if (string.IsNullOrEmpty(fileUrl))
                        {
                            return ResponseHelper.HandleCustomException(new CustomException("Error al subir el archivo.", 500));
                        }
                    }
                }
                else if (Request.Form.TryGetValue("borrarFoto", out var borrar) && borrar == "true")
                {
                    fileUrl = "borrar";
                }

                await _playerBLL.UpdateJugador(fileUrl, id, datosNuevos);

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
        [HttpGet("SearchPlayers")]
        public async Task<IActionResult> SearchPlayers(string query)
        {
            try
            {
                var listado = await _playerBLL.SearchPlayers(query);
                return ResponseHelper.Success("Jugadores encontrados", listado);
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
