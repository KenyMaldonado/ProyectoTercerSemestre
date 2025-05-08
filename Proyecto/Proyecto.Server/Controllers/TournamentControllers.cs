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
        private readonly AzureBlobService _blobService;
        /// <summary>
        /// Contructor
        /// </summary>
        public TournamentControllers(ITournamentBLL tournamentBLL, AzureBlobService blobService)
        {
            this.tournamentBLL = tournamentBLL;
            _blobService = blobService;
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
        [Authorize(Roles = "Admin")]
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
                if (result == null || !result.Any())
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No hay torneos en la base de datos", 404));
                }

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

        [HttpGet("GetSubTournaments")]

        public async Task<IActionResult> GerSubTournaments(int TournamentID)
        {
            try
            {
                var listado = await tournamentBLL.GetSubTournaments(TournamentID);
                if (listado == null || !listado.Any())
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No hay subtorneos registrados", 404));
                }  

                return ResponseHelper.Success("Listado de subtorneos",listado);
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


        [HttpGet("GetTournamentGameTypes")]

        public async Task<IActionResult> GetTournamentGameTypes()
        {
            try
            {
                var result = await tournamentBLL.GetTiposJuego();
                if (result == null || !result.Any())
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No hay tipos de juego en la base de datos", 404));
                }

                return ResponseHelper.Success("Torneos Actuales", result);
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
        [HttpPost("UploadBasesTournaments")]
        public async Task<IActionResult> UploadBasesTournaments(IFormFile file, [FromForm] string customFileName)
        {
            try
            {
                // Limitar el tamaño del archivo a 5 MB (5 * 1024 * 1024 bytes)
                long maxFileSize = 5 * 1024 * 1024;

                if (file == null || file.Length == 0)
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No se ha proporcionado un archivo válido.", 400));
                }

                if (file.Length > maxFileSize)
                {
                    return ResponseHelper.HandleCustomException(new CustomException("El archivo supera el límite de 5 MB.", 413));
                }

                if (Path.GetExtension(file.FileName).ToLower() != ".pdf")
                {
                    return ResponseHelper.HandleCustomException(new CustomException("Solo se permiten archivos PDF.", 415));
                }

                if (string.IsNullOrWhiteSpace(customFileName))
                {
                    return ResponseHelper.HandleCustomException(new CustomException("El nombre personalizado no puede estar vacío.", 400));
                }

                using (var stream = file.OpenReadStream())
                {
                    // Asegurar que el nombre del archivo no tenga extensión
                    string fileName = $"{customFileName}.pdf";
                    var fileUrl = await _blobService.UploadFileAsync(stream, fileName);

                    if (string.IsNullOrEmpty(fileUrl))
                    {
                        return ResponseHelper.HandleCustomException(new CustomException("Error al subir el archivo a Azure Blob Storage.", 500));
                    }

                    return ResponseHelper.Success("Archivo subido correctamente.", new { fileUrl });
                }
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

