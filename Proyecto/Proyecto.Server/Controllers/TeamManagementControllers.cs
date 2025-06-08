using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;
using static Proyecto.Server.DTOs.TournamentDTO;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class TeamManagementControllers : ControllerBase
    {
        private readonly ITeamManagementBLL _teamManagementBLL;

        public TeamManagementControllers(ITeamManagementBLL teamManagementBLL)
        {
            this._teamManagementBLL = teamManagementBLL;
        }

        [HttpGet("GetDepartamentos")]
        public IActionResult GetDepartamentos()
        {
            try
            {
                var consulta = _teamManagementBLL.ObtenerDepartamentos();
                return ResponseHelper.Success("Departamentos obtenidos exitosamente", consulta);
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

        [HttpGet("GetMunicipiosByDepartamento")]
        public IActionResult GetMunicipiosByDepartamento(int DepartamentoID)
        {
            try
            {
                var listaMunicipios = _teamManagementBLL.ObtenerMunicios(DepartamentoID);
                if (listaMunicipios == null || !listaMunicipios.Any())
                {
                    return ResponseHelper.HandleCustomException(new CustomException("El departamento no existe", 404));
                }
                return ResponseHelper.Success("Municipios Obtenidos Exitosamente", listaMunicipios);
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

        [HttpGet("GetFacultades")]
        public IActionResult GetFacultades()
        {
            try
            {
                var Listado = _teamManagementBLL.ObtenerFacultades();
                return ResponseHelper.Success("Facultades obtenidas exitosamente", Listado);
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

        [HttpGet("GetCarrerasByFacultad")]
        public IActionResult GetCarrerasByFacultad(int FacultadId)
        {
            try
            {
                var Carreras = _teamManagementBLL.ObtenerCarrera(FacultadId);
                if (Carreras == null || !Carreras.Any())
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No existe esa carrera", 404));
                }
                return ResponseHelper.Success("Las carreras enviadas exitosamente", Carreras);

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

        [HttpGet("GetSemestreByCarrera")]
        public IActionResult GetSemestreByCarrera(int CarreraId)
        {
            try
            {
                var ListaSemestres = _teamManagementBLL.ObtenerSemestres(CarreraId);
                if (ListaSemestres == null || !ListaSemestres.Any())
                {
                    return ResponseHelper.HandleCustomException(new CustomException("La carrera no existe", 404));
                }

                return ResponseHelper.Success("Semestres Obtenidos exitosamente", ListaSemestres);
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

        [HttpPost("CreateRegistrationTeam")]
        public async Task<IActionResult> CreateRegistrationTeam([FromBody] RegistrationTournamentsDTO.NewTeamRegistration datos)
        {
            try
            {
                await _teamManagementBLL.CrearNuevaInscripcion(datos);
                return ResponseHelper.Created("Se ingreso la inscripcion correctamente");

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

        [HttpPost("RegistrationStart")]
        public async Task<IActionResult> RegistrationStart(string correo)
        {
            try
            {
                var datos = await _teamManagementBLL.RegistrationStart(correo);
                return ResponseHelper.Success("Se obtuvo el número de inscripción exitosamente", datos);
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

        [HttpPatch("SaveRegistration")]
        public async Task<IActionResult> SaveRegistration(string json, string NumeroFormulario)
        {
            try
            {
                await _teamManagementBLL.GuardarFormulario(json, NumeroFormulario);
                return ResponseHelper.Success("Datos guardados exitosamente");
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

        [HttpGet("GetInscripciones")]
        public async Task<IActionResult> GetInscripciones()
        {
            try
            {
                var inscripciones = await _teamManagementBLL.GetInscripciones();
                return ResponseHelper.Success("Inscripciones obtenidas exitosamente", inscripciones);
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

        [HttpGet("GetInformationRegistration")]
        public async Task<IActionResult> GetInformationRegistration(int InscripcionId)
        {
            try
            {
                var datos = await _teamManagementBLL.GetInformationRegistration(InscripcionId);
                return ResponseHelper.Success("Datos de la inscripcion", datos);
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
        [HttpPatch("UpdateEstadoInscripcion")]
        public async Task<IActionResult> UpdateEstadoInscripcion([FromBody] UpdateEstadoInscripcionDto request)
        {
            try
            {
                await _teamManagementBLL.UpdateEstadoInscripcion(request.inscripcionID,request.estado,request.comentario);
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


    }
}
