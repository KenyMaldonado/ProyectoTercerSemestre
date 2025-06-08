using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;
using Proyecto.Server.Utils;

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

    }
}
