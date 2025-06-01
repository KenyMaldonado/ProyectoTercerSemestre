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
    public class AdditionalFeaturesControllers : Controller
    {
        private readonly IAdditionalFeaturesBLL _additionalFeaturesBLL;
        private readonly AzureBlobService _blobService;
        public AdditionalFeaturesControllers(IAdditionalFeaturesBLL additionalFeatures, AzureBlobService blobService)
        {
            _additionalFeaturesBLL = additionalFeatures;
            _blobService = blobService;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("CreateNews")]
        public async Task<IActionResult> CreateNews(IFormFile file, [FromForm] AdditionalFeaturesDTO.NewsDTO newNews)
        {
            try
            {
                var IdUsuario = User.GetUsuarioId();
                if (IdUsuario == null)
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No se ha proporcionado un ID de usuario válido.", 400));
                }
                newNews.CreateByUserID = IdUsuario.Value;

                newNews.NewsId = await _additionalFeaturesBLL.CreateNews(newNews);

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
                    string fileName = $"{newNews.NewsId.ToString()}.jpg";
                    var fileUrl = await _blobService.UploadImageNewsAsync(stream, fileName);

                    if (string.IsNullOrEmpty(fileUrl))
                    {
                        return ResponseHelper.HandleCustomException(new CustomException("Error al subir el archivo a Azure Blob Storage.", 500));
                    }
                    newNews.ImageUrl = fileUrl;
                    await _additionalFeaturesBLL.UpdateLinkNews(newNews);
                    return ResponseHelper.Success("Se a creado la noticia exitosamente");
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

        [Authorize(Roles = "Admin")]
        [HttpPut("UpdateNews")]
        public async Task<IActionResult> UpdateNews([FromForm] AdditionalFeaturesDTO.NewsDTO newNews, IFormFile? file)
        {
            try
            {
                string? fileUrl = null;

                if (file != null && file.Length > 0)
                {
                    // Verificar si es un archivo especial para eliminar
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

                        using var stream = file.OpenReadStream();
                        string fileName = $"{newNews.NewsId}{extension}";
                        fileUrl = await _blobService.UploadImageNewsAsync(stream, fileName);
                        newNews.ImageUrl = fileUrl;
                        await _additionalFeaturesBLL.UpdateLinkNews(newNews);
                        if (string.IsNullOrEmpty(fileUrl))
                        {
                            return ResponseHelper.HandleCustomException(
                                new CustomException("Error al subir el archivo.", 500));
                        }
                    }
                }
                else if (Request.Form.TryGetValue("borrarFoto", out var borrar) && borrar == "true")
                {
                    fileUrl = "borrar";
                }

                if (fileUrl == "borrar")
                    newNews.ImageUrl = null;

                await _additionalFeaturesBLL.UpdateNews(newNews);

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
        [HttpPatch("UpdateVisible")]
        public async Task<IActionResult> UpdateVisible(int NoticiaId)
        {
            try
            {
                await _additionalFeaturesBLL.UpdateVisibleNews(NoticiaId);
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
        [HttpDelete("Delete")]
        public async Task<IActionResult> Delete(int NoticiaId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _additionalFeaturesBLL.DeleteNoticia(NoticiaId);
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

        [HttpGet("GetNews")]
        public async Task<IActionResult> GetNews()
        {
            try
            {
                var listado = await _additionalFeaturesBLL.GetNews();
                return ResponseHelper.Success("Listado de noticias",listado);
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
