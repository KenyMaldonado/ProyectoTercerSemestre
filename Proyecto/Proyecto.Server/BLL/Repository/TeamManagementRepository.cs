using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;

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

        public async Task SaveRegistration(string codigoInscripcion, string json)
        {
            var consulta =  _appDbContext.PreInscripcions
                            .SingleOrDefault(x => x.Codigo == codigoInscripcion);

            if (consulta == null) 
            {
                throw new Exception("Error al guardar los datos");
            }

            consulta.DataSave = json;
            await _appDbContext.SaveChangesAsync();

        }

        public async Task CreateNewRegistration(RegistrationTournamentsDTO.NewTeamRegistration datos)
        {
            int EquipoIdNew = 0;

            using var transaction = await _appDbContext.Database.BeginTransactionAsync();
            try
            {
                // 1. Insertar equipo
                Equipo equipo = new Equipo
                {
                    Nombre = datos.NewTeam.Nombre,
                    ColorUniforme = datos.NewTeam.ColorUniforme,
                    ColorUniformeSecundario = datos.NewTeam.ColorUniformeSecundario,
                    FacultadId = datos.NewTeam.FacultadId,
                    SubTorneoId = datos.IdSubtorneo
                };
                _appDbContext.Equipos.Add(equipo);
                await _appDbContext.SaveChangesAsync();
                EquipoIdNew = equipo.EquipoId;

                // 2. Crear lista de jugadores (inicia con el capitán)
                var ListaJugadores = new List<Jugador>
                {
                    new Jugador
                    {
                        Nombre = datos.capitan.jugadorCapitan.Nombre,
                        Apellido = datos.capitan.jugadorCapitan.Apellido,
                        Carne = datos.capitan.jugadorCapitan.Carne,
                        Fotografia = datos.capitan.jugadorCapitan.Fotografia,
                        MunicipioId = datos.capitan.jugadorCapitan.MunicipioId,
                        CarreraSemestreId = datos.capitan.jugadorCapitan.CarreraSemestreId,
                        FechaNacimiento = datos.capitan.jugadorCapitan.FechaNacimiento,
                        Edad = datos.capitan.jugadorCapitan.Edad,
                        Telefono = datos.capitan.jugadorCapitan.Telefono
                    }
                };

                // 3. Agregar jugadores del listado
                ListaJugadores.AddRange(datos.ListaJugadores.Select(jugador => new Jugador
                {
                    Nombre = jugador.Nombre,
                    Apellido = jugador.Apellido,
                    Carne = jugador.Carne,
                    Fotografia = jugador.Fotografia,
                    MunicipioId = jugador.MunicipioId,
                    CarreraSemestreId = jugador.CarreraSemestreId,
                    FechaNacimiento = jugador.FechaNacimiento,
                    Edad = jugador.Edad,
                    Telefono = jugador.Telefono
                }));

                await _appDbContext.AddRangeAsync(ListaJugadores);
                await _appDbContext.SaveChangesAsync();

                // 4. Crear lista de asignaciones (incluye al capitan y demás jugadores)
                var ListaAsignaciones = new List<JugadorEquipo>();
                foreach(var jugador in ListaJugadores)
                {
                    var asignacion = jugador.Carne == datos.capitan.jugadorCapitan.Carne
                    ? datos.capitan.jugadorCapitan.asignacion
                    : datos.ListaJugadores.First(j => j.Carne == jugador.Carne).asignacion;

                    ListaAsignaciones.Add(new JugadorEquipo
                    {
                        JugadorId = jugador.JugadorId,
                        EquipoId = EquipoIdNew,
                        PosicionId = asignacion.PosicionId,
                        Dorsal = asignacion.Dorsal
                    });

                }
                await _appDbContext.AddRangeAsync(ListaAsignaciones);

                // 5. Insertar capitán
                Capitan capitan = new Capitan
                {
                    JugadorId = ListaJugadores.First().JugadorId,
                    CorreoElectronico = datos.capitan.CorreoElectronico,
                };
                await _appDbContext.Capitans.AddAsync(capitan);

                // 6. Insertar inscripción
                Inscripcion nuevaInscripcion = new Inscripcion
                {
                    EquipoId = EquipoIdNew,
                    FechaInscripcion = DateTime.Now,
                    SubTorneoId = datos.IdSubtorneo,
                    PreInscripcionId = datos.PreInscripcionId
                };
                await _appDbContext.Inscripcions.AddAsync(nuevaInscripcion);

                await _appDbContext.SaveChangesAsync();
                await transaction.CommitAsync(); 
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var mensaje = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                throw new CustomException("Error al registrar el equipo: " + mensaje);
            }
        }

        

    }
}
