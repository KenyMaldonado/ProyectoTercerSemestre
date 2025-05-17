using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;

namespace Proyecto.Server.BLL.Service
{
    public class TeamManagementBLL : ITeamManagementBLL
    {
        private readonly ITeamManagementRepository _teamManagementRepository;
        private readonly IConfiguration _configuration;

        public TeamManagementBLL(ITeamManagementRepository teamManagementRepository, IConfiguration configuration)
        {
            _teamManagementRepository = teamManagementRepository;
            _configuration = configuration;
        }   

        public List<RegistrationTournamentsDTO.DepartametosDTO> ObtenerDepartamentos()
        {
            try
            {
                var ListaDepartamentos = _teamManagementRepository.GetDepartamentos();
                if (ListaDepartamentos == null)
                {
                    throw new CustomException("No se obtenieron Datos, intente más tarde",404);
                }
                return ListaDepartamentos;
            }
            catch
            {
                throw new CustomException("Error al consultar los departamentos", 500);
            }
            
        }

        public List<RegistrationTournamentsDTO.MunicipiosDTO> ObtenerMunicios(int DepartamentoId)
        {
            try
            {
                var ListaMunicipios = _teamManagementRepository.GetMunicipiosByDepartamento(DepartamentoId);
                return ListaMunicipios;
            }
            catch (CustomException ex)
            {
                throw new CustomException(ex.Message, 500);
            }
        }

        public List<RegistrationTournamentsDTO.FacultadDTO> ObtenerFacultades()
        {
            try
            {
                var ListaFacultades = _teamManagementRepository.GetFacultades();
                return ListaFacultades;
            }
            catch (Exception ex)
            {
                {
                    throw new CustomException(ex.Message, 500);
                }
            }
        }


        public List<RegistrationTournamentsDTO.carreraDTO> ObtenerCarrera(int FacultadId)
        {
            try
            {
                return _teamManagementRepository.GetCarreras(FacultadId);

            }
            catch (CustomException ex)
            {
                throw new CustomException(ex.Message);
            }
        }

        public List<RegistrationTournamentsDTO.CarreraSemestreDTO> ObtenerSemestres(int CarreraId)
        {
            try
            {
                return _teamManagementRepository.GetSemestreSeccion(CarreraId);  
            }
            catch (CustomException ex)
            {
                throw new CustomException(ex.Message);
            }
        }

        public async Task<RegistrationTournamentsDTO.RegistrationStartDTO> RegistrationStart(string correo)
        {
            var currentYear = DateTime.Now.Year;
            var prefix = $"INS-{currentYear}-";
            int nextNumber = 1;

            try
            {
                var consulta = await _teamManagementRepository.GetDataRegistration(correo);

                if (consulta == null)
                {
                    var codigo = await _teamManagementRepository.GetLastCode();

                    if (!string.IsNullOrEmpty(codigo))
                    {
                        var lastNumberPart = codigo.Split('-').Last();

                        if (int.TryParse(lastNumberPart, out int lastNumber))
                        {
                            nextNumber = lastNumber + 1;
                        }
                        else
                        {
                            throw new CustomException("Error al crear el código de inscripción", 500);
                        }

                        string formattedNumber = nextNumber.ToString("D3");
                        string newCode = $"{prefix}{formattedNumber}";

                        var datos = new RegistrationTournamentsDTO.RegistrationStartDTO
                        {
                            Codigo = newCode,
                            Email = correo,
                            DataSave = null,
                            IsNew = true
                        };

                         _teamManagementRepository.CreateDataRegistration(datos);

                        return await _teamManagementRepository.GetDataRegistration(correo);
                    }
                    else
                    {
                        throw new CustomException("Error al obtener el último número de inscripción", 500);
                    }
                }
                else
                {
                    consulta.IsNew = false;
                    return consulta;
                }
            }
            catch (CustomException)
            {
                throw; // Ya es una excepción personalizada, solo la propagas
            }
            catch (Exception ex)
            {
                throw new CustomException($"Error inesperado: {ex.Message}", 500);
            }
        }

        public async Task GuardarFormulario(string json, string Code)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(json))
                    throw new CustomException("El JSON no puede estar vacío.", 400);

                await _teamManagementRepository.SaveRegistration(Code, json);

            }
            catch
            {
                throw new CustomException("Error al guardar el formulario ", 500);
            }
            

        }

        public async Task CrearNuevaInscripcion(RegistrationTournamentsDTO.NewTeamRegistration datos)
        {
            try
            {
                var errores = new List<string>();

                if (datos == null)
                {
                    throw new CustomException("Los datos de inscripción no pueden ser nulos.");
                }

                if (datos.NewTeam == null)
                    errores.Add("El objeto 'NewTeam' es obligatorio.");

                if (datos.capitan == null)
                    errores.Add("El objeto 'capitan' es obligatorio.");

                if (datos.capitan?.jugadorCapitan == null)
                    errores.Add("El objeto 'jugadorCapitan' dentro de 'capitan' es obligatorio.");
                if (datos.capitan?.jugadorCapitan.asignacion == null)
                    errores.Add("El objeto 'Asignacion' dentro de 'jugadorCapitan' dentro de 'capitan' es obligatorio.");

                if (datos.ListaJugadores == null || !datos.ListaJugadores.Any())
                    errores.Add("La lista de jugadores no puede estar vacía.");

                // Puedes agregar alguna validación básica del IdSubtorneo, por ejemplo:
                if (datos.IdSubtorneo <= 0)
                    errores.Add("El 'IdSubtorneo' debe ser mayor a cero.");

                // Si hay errores, lanza excepción con todos ellos
                if (errores.Any())
                {
                    throw new CustomException("Errores de validación:\n" + string.Join("\n", errores));
                }

                // Lógica de guardado o procesamiento va aquí...
                await _teamManagementRepository.CreateNewRegistration(datos);
            }
            catch (CustomException ex)
            {
                throw new CustomException(ex.Message);
            }
        }

        
    }
}
