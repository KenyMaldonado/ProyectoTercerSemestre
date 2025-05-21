using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.BLL.Service;
using Proyecto.Server.DTOs;
using Proyecto.Server.Utils;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class TeamController : Controller
    {
        private readonly ITeamBLL _teamBLL;
        private readonly AzureBlobService _blobService;

        public TeamController(ITeamBLL teamBll, AzureBlobService blobService)
        {
            _teamBLL = teamBll;
            _blobService = blobService; 
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

        [Authorize(Roles = "Admin")]
        [HttpPut("UpdateTeam")]
        public async Task<IActionResult> UpdateTeam(EquipoDTO.UpdateTeamDTO datos)
        {
            try
            {
                await _teamBLL.UpdateEquipo(datos);
                return NoContent();
            }
            catch(CustomException ex)
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            catch(Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }
        }


        [Authorize(Roles = "Admin")]
        [HttpPatch("UpdateLogoTeam")]
        public async Task<IActionResult> UpdateLogoTeam(IFormFile file, int TeamId)
        {
            try
            {
                long maxFileSize = 5 * 1024 * 1024;
                if (file == null || file.Length == 0)
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No se ha proporcionado un archivo válido.", 400));
                }

                if (file.Length > maxFileSize)
                {
                    return ResponseHelper.HandleCustomException(new CustomException("El archivo supera el límite de 5 MB.", 413));
                }

                string[] validImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };

                if (!validImageExtensions.Contains(Path.GetExtension(file.FileName).ToLower()))
                {
                    return ResponseHelper.HandleCustomException(new CustomException("Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF, BMP, WEBP).", 415));
                }


                using (var stream = file.OpenReadStream())
                {
                    // Asegurar que el nombre del archivo no tenga extensión
                    string fileName = $"{TeamId.ToString()}.jpg";
                    var fileUrl = await _blobService.UploadImageAsync(stream, fileName);

                    if (string.IsNullOrEmpty(fileUrl))
                    {
                        return ResponseHelper.HandleCustomException(new CustomException("Error al subir el archivo a Azure Blob Storage.", 500));
                    }
                    _teamBLL.UpdateLinkLogoTeam(TeamId, fileUrl);
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
