using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Repository
{
    public class TeamManagementRepository : ITeamManagementRepository
    {
        private readonly AppDbContext _appDbContext;

        public TeamManagementRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public List<RegistrationTournamentsDTO.MunicipiosDTO> GetMunicipiosByDepartamento(int IdDepartamento)
        {
            var municipio = _appDbContext.Municipios
                .Where(x=> x.DepartamentoId == IdDepartamento)
                .Select(
                x=> new RegistrationTournamentsDTO.MunicipiosDTO
                {
                    DepartamentoId = x.DepartamentoId,
                    MunicipioId = x.MunicipioId,
                    Nombre = x.Nombre
                })
                .OrderBy(x=> x.Nombre)
                .ToList();

            return municipio;
        }

        public List<RegistrationTournamentsDTO.DepartametosDTO> GetDepartamentos()
        {
            var Departamentos = _appDbContext.Departamentos.Select(x => new RegistrationTournamentsDTO.DepartametosDTO
            {
                Nombre = x.Nombre,
                DepartamentoId = x.DepartamentoId
            }).ToList();

            return Departamentos;
        }

        public List<RegistrationTournamentsDTO.FacultadDTO> GetFacultades()
        {
            var ListaFacultades = _appDbContext.Facultads.Where(x=>x.Estado == true)
                .Select(x=> new RegistrationTournamentsDTO.FacultadDTO
                {
                    Nombre= x.Nombre,
                    FacultadId = x.FacultadId
                }).ToList();
            return ListaFacultades;
        }

        public List<RegistrationTournamentsDTO.carreraDTO> GetCarreras(int FacultadId)
        {
            var ListaCarreras = _appDbContext.Carreras
                .Where (x=>x.Estado == true && x.FacultadId == FacultadId)
                .Select(x=> new RegistrationTournamentsDTO.carreraDTO
                {
                    CarreraId = x.CarreraId,
                    Nombre = x.Nombre,
                    Estado = x.Estado,
                    FacultadId= x.FacultadId
                })
                .ToList();

            return ListaCarreras;
        }

        public List<RegistrationTournamentsDTO.CarreraSemestreDTO> GetSemestreSeccion(int CarreraId)
        {
            var ListadoSemestres = _appDbContext.CarreraSemestres
                .Where(x => x.CarreraId1 == CarreraId)
                .OrderBy(x => x.Semestre)
                .Select(x => new RegistrationTournamentsDTO.CarreraSemestreDTO
                {
                    CarreraId = x.CarreraId,
                    CodigoCarrera = x.CodigoCarrera,
                    CarreraId1 = x.CarreraId1
                })
                .OrderBy(x => x.CodigoCarrera)
                .ToList();

            return ListadoSemestres;
        }

        public async Task<RegistrationTournamentsDTO.RegistrationStartDTO> GetDataRegistration(string correo)
        {
            var data = await _appDbContext.PreInscripcions
                        .Where(x => x.Email.ToLower() == correo.ToLower())
                        .Select(x => new RegistrationTournamentsDTO.RegistrationStartDTO
                        {
                            PreInscripcionId = x.PreInscripcionId,
                            Email = x.Email,
                            Codigo = x.Codigo,
                            DataSave = x.DataSave,
                        })
                        .FirstOrDefaultAsync();
            return data;
        }

        public void CreateDataRegistration(RegistrationTournamentsDTO.RegistrationStartDTO datos)
        {
            PreInscripcion Data = new PreInscripcion
            {
                Codigo = datos.Codigo,
                DataSave = datos.DataSave,
                Email = datos.Email,
            };
            
            _appDbContext.PreInscripcions.Add(Data);
            _appDbContext.SaveChanges();
        }

        public async Task<string?> GetLastCode()
        {
            var consulta = await _appDbContext.PreInscripcions
                .OrderByDescending(x => x.Codigo)
                .FirstOrDefaultAsync();
            return consulta?.Codigo;
        }

    }
}
