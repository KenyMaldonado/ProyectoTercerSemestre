using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface ITeamManagementRepository
    {
        List<RegistrationTournamentsDTO.MunicipiosDTO> GetMunicipiosByDepartamento(int IdDepartamento);
        List<RegistrationTournamentsDTO.DepartametosDTO> GetDepartamentos();
        List<RegistrationTournamentsDTO.FacultadDTO> GetFacultades();
        List<RegistrationTournamentsDTO.carreraDTO> GetCarreras(int FacultadId);
        List<RegistrationTournamentsDTO.CarreraSemestreDTO> GetSemestreSeccion(int CarreraId);
        Task<RegistrationTournamentsDTO.RegistrationStartDTO> GetDataRegistration(string correo);
        void CreateDataRegistration(RegistrationTournamentsDTO.RegistrationStartDTO datos);
        Task<string?> GetLastCode();
        Task SaveRegistration(string codigoInscripcion, string json);
        Task CreateNewRegistration(RegistrationTournamentsDTO.NewTeamRegistration datos);


    }
}
