using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface ITeamManagementBLL
    {
        List<RegistrationTournamentsDTO.DepartametosDTO> ObtenerDepartamentos();
        List<RegistrationTournamentsDTO.MunicipiosDTO> ObtenerMunicios(int DepartamentoId);
        List<RegistrationTournamentsDTO.FacultadDTO> ObtenerFacultades();
        List<RegistrationTournamentsDTO.carreraDTO> ObtenerCarrera(int FacultadId);
        List<RegistrationTournamentsDTO.CarreraSemestreDTO> ObtenerSemestres(int CarreraId);
        Task<RegistrationTournamentsDTO.RegistrationStartDTO> RegistrationStart(string correo);
        Task GuardarFormulario(string json, string Code);
        Task CrearNuevaInscripcion(RegistrationTournamentsDTO.NewTeamRegistration datos);
        Task<List<RegistrationTournamentsDTO.GetRegistrationDTO>> GetInscripciones();
        Task<RegistrationTournamentsDTO.GetInformationRegistration> GetInformationRegistration(int inscripcionId);


    }
}
