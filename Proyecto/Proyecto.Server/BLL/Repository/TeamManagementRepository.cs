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
                .Where(x => x.DepartamentoId == IdDepartamento)
                .Select(
                x => new RegistrationTournamentsDTO.MunicipiosDTO
                {
                    DepartamentoId = x.DepartamentoId,
                    MunicipioId = x.MunicipioId,
                    Nombre = x.Nombre
                })
                .OrderBy(x => x.Nombre)
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
            var ListaFacultades = _appDbContext.Facultads.Where(x => x.Estado == true)
                .Select(x => new RegistrationTournamentsDTO.FacultadDTO
                {
                    Nombre = x.Nombre,
                    FacultadId = x.FacultadId
                }).ToList();
            return ListaFacultades;
        }

        public List<RegistrationTournamentsDTO.carreraDTO> GetCarreras(int FacultadId)
        {
            var ListaCarreras = _appDbContext.Carreras
                .Where(x => x.Estado == true && x.FacultadId == FacultadId)
                .Select(x => new RegistrationTournamentsDTO.carreraDTO
                {
                    CarreraId = x.CarreraId,
                    Nombre = x.Nombre,
                    Estado = x.Estado,
                    FacultadId = x.FacultadId
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
                    CarreraSemestreId = x.CarreraId,
                    CodigoCarrera = x.CodigoCarrera,
                    CarreraId = x.CarreraId1,
                    Semestre = x.Semestre,
                    Seccion = x.Seccion
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
            var consulta = _appDbContext.PreInscripcions
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
            using var transaction = await _appDbContext.Database.BeginTransactionAsync();
            try
            {
                // 1. Insertar equipo
                var equipo = new Equipo
                {
                    Nombre = datos.NewTeam.Nombre,
                    ColorUniforme = datos.NewTeam.ColorUniforme,
                    ColorUniformeSecundario = datos.NewTeam.ColorUniformeSecundario,
                    FacultadId = datos.NewTeam.FacultadId,
                    SubTorneoId = datos.IdSubtorneo
                };
                _appDbContext.Equipos.Add(equipo);
                await _appDbContext.SaveChangesAsync();
                int equipoIdNuevo = equipo.EquipoId;

                // 2. Obtener o insertar jugador (capitán y jugadores)
                var jugadoresFinales = new List<Jugador>();
                var carnes = datos.ListaJugadores.Select(j => j.Carne).ToList();
                carnes.Add(datos.capitan.jugadorCapitan.Carne);

                var jugadoresExistentes = await _appDbContext.Jugadors
                    .Where(j => carnes.Contains(j.Carne))
                    .ToDictionaryAsync(j => j.Carne, j => j);

                // 2.1 Procesar capitán
                Jugador jugadorCapitan;
                if (jugadoresExistentes.TryGetValue(datos.capitan.jugadorCapitan.Carne, out jugadorCapitan) == false)
                {
                    jugadorCapitan = new Jugador
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
                    };
                    _appDbContext.Jugadors.Add(jugadorCapitan);
                    jugadoresFinales.Add(jugadorCapitan);
                }

                // 2.2 Procesar jugadores
                foreach (var jugadorDTO in datos.ListaJugadores)
                {
                    if (!jugadoresExistentes.TryGetValue(jugadorDTO.Carne, out var jugador))
                    {
                        jugador = new Jugador
                        {
                            Nombre = jugadorDTO.Nombre,
                            Apellido = jugadorDTO.Apellido,
                            Carne = jugadorDTO.Carne,
                            Fotografia = jugadorDTO.Fotografia,
                            MunicipioId = jugadorDTO.MunicipioId,
                            CarreraSemestreId = jugadorDTO.CarreraSemestreId,
                            FechaNacimiento = jugadorDTO.FechaNacimiento,
                            Edad = jugadorDTO.Edad,
                            Telefono = jugadorDTO.Telefono
                        };
                        _appDbContext.Jugadors.Add(jugador);
                        jugadoresFinales.Add(jugador);
                    }
                }

                if (jugadoresFinales.Any())
                {
                    await _appDbContext.SaveChangesAsync(); // Guardar solo los nuevos jugadores
                }

                // 3. Obtener todos los jugadores procesados (incluyendo los recién insertados)
                jugadoresExistentes = await _appDbContext.Jugadors
                    .Where(j => carnes.Contains(j.Carne))
                    .ToDictionaryAsync(j => j.Carne, j => j);

                // 4. Asignar jugadores al equipo
                var asignaciones = new List<JugadorEquipo>();

                foreach (var carne in carnes.Distinct())
                {
                    var jugador = jugadoresExistentes[carne];

                    var asignacionDTO = (carne == datos.capitan.jugadorCapitan.Carne)
                        ? datos.capitan.jugadorCapitan.asignacion
                        : datos.ListaJugadores.First(j => j.Carne == carne).asignacion;

                    asignaciones.Add(new JugadorEquipo
                    {
                        JugadorId = jugador.JugadorId,
                        EquipoId = equipoIdNuevo,
                        PosicionId = asignacionDTO.PosicionId,
                        Dorsal = asignacionDTO.Dorsal
                    });
                }

                await _appDbContext.JugadorEquipos.AddRangeAsync(asignaciones);

                // 5. Insertar capitán solo si aún no lo es
                var capitanJugadorId = jugadoresExistentes[datos.capitan.jugadorCapitan.Carne].JugadorId;
                bool yaEsCapitan = await _appDbContext.Capitans.AnyAsync(c => c.JugadorId == capitanJugadorId);

                if (!yaEsCapitan)
                {
                    var capitan = new Capitan
                    {
                        JugadorId = capitanJugadorId,
                        CorreoElectronico = datos.capitan.CorreoElectronico
                    };
                    await _appDbContext.Capitans.AddAsync(capitan);
                }

                // 6. Insertar inscripción
                var inscripcion = new Inscripcion
                {
                    EquipoId = equipoIdNuevo,
                    FechaInscripcion = DateTime.Now,
                    SubTorneoId = datos.IdSubtorneo,
                    PreInscripcionId = datos.PreInscripcionId
                };
                await _appDbContext.Inscripcions.AddAsync(inscripcion);

                // 7. Guardar todo
                await _appDbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var mensaje = ex.InnerException?.Message ?? ex.Message;
                throw new CustomException("Error al registrar el equipo: " + mensaje);
            }
        }

        public async Task<List<RegistrationTournamentsDTO.GetRegistrationDTO>> GetInscripciones()
        {
            var listado = await _appDbContext.Inscripcions
                .Where(i => i.Estado != Inscripcion.EstadosInscripcion.Aprobada
                         && i.Estado != Inscripcion.EstadosInscripcion.Cancelada
                         && i.Estado != Inscripcion.EstadosInscripcion.Rechazada)
                .Select(i => new RegistrationTournamentsDTO.GetRegistrationDTO
                {
                    InscripcionId = i.InscripcionId,
                    PreInscripcionId = i.PreInscripcionId,
                    Codigo = i.PreInscripcion.Codigo ?? "No encontrado",
                    EquipoId = i.EquipoId,
                    NombreEquipo = i.Equipo.Nombre,
                    Estado = i.Estado.ToString(),
                    FechaInscripcion = i.FechaInscripcion,
                    subTorneoId = i.SubTorneoId,
                    Descripcion = "Prueba",

                    NombreCapitan = (from c in _appDbContext.Capitans
                                     join j in _appDbContext.Jugadors on c.JugadorId equals j.JugadorId
                                     join je in _appDbContext.JugadorEquipos on j.JugadorId equals je.JugadorId
                                     where je.EquipoId == i.EquipoId
                                     select j.Nombre).FirstOrDefault() ?? "No encontrado",
                    ApellidoCapitan = (from c in _appDbContext.Capitans
                                       join j in _appDbContext.Jugadors on c.JugadorId equals j.JugadorId
                                       join je in _appDbContext.JugadorEquipos on j.JugadorId equals je.JugadorId
                                       where je.EquipoId == i.EquipoId
                                       select j.Apellido).FirstOrDefault() ?? "No encontrado",
                    CorreoCapitan = (from c in _appDbContext.Capitans
                                     join j in _appDbContext.Jugadors on c.JugadorId equals j.JugadorId
                                     join je in _appDbContext.JugadorEquipos on j.JugadorId equals je.JugadorId
                                     where je.EquipoId == i.EquipoId
                                     select c.CorreoElectronico).FirstOrDefault() ?? "No encontrado"
                })
                .ToListAsync();

            return listado;
        }


        public async Task<RegistrationTournamentsDTO.GetInformationRegistration> GetDatosInscripcion(int inscripcionId)
        {
            var resultado = await _appDbContext.Inscripcions
                .Where(i => i.InscripcionId == inscripcionId)
                .Select(i => new RegistrationTournamentsDTO.GetInformationRegistration
                {
                    InscripcionID = i.InscripcionId,
                    Estado = i.Estado.ToString(),
                    FechaInscripcion = i.FechaInscripcion,
                    IdSubtorneo = i.SubTorneoId,
                    NombreSubtorneo = i.SubTorneo.Categoria,
                    NombreTorneo = i.SubTorneo.Torneo.Nombre,
                    PreInscripcionId = i.PreInscripcionId,
                    Descripcion = i.ComentarioInscripcion ?? "No se ha modificado",
                    InfoEquipo = new EquipoDTO.GetTeam
                    {
                        EquipoId = i.EquipoId,
                        Nombre = i.Equipo.Nombre,
                        ColorUniforme = i.Equipo.ColorUniforme,
                        ColorUniformeSecundario = i.Equipo.ColorUniformeSecundario,
                        Estado = (EquipoDTO.EstadoEquipo)i.Equipo.Estado,
                        ImagenEquipo = i.Equipo.ImagenEquipo,
                        FacultadId = i.Equipo.FacultadId,
                        NameFacultad = i.Equipo.Facultad.Nombre
                    },
                    Jugadores = i.Equipo.JugadorEquipos
                    .Where(j => j.EquipoId == i.EquipoId && j.Estado == false)
                    .Select(j => new JugadorDTO
                    {
                        JugadorId = j.JugadorId,
                        Nombre = j.Jugador.Nombre,
                        Apellido = j.Jugador.Apellido,
                        Carne = j.Jugador.Carne,
                        Fotografia = j.Jugador.Fotografia,
                        Estado =(JugadorDTO.EstadoJugador)j.Jugador.Estado,
                        MunicipioId = j.Jugador.MunicipioId,
                        MunicipioName = j.Jugador.Municipio.Nombre,
                        DepartamentoId = j.Jugador.Municipio.DepartamentoId,
                        DepartamentoName = j.Jugador.Municipio.Departamento.Nombre,
                        CarreraId = j.Jugador.CarreraSemestre.CarreraId,
                        CarreraName = j.Jugador.CarreraSemestre.CarreraId1Navigation.Nombre,
                        CarreraSemestreId = j.Jugador.CarreraSemestreId,
                        Semestre = j.Jugador.CarreraSemestre.Semestre,
                        Seccion = j.Jugador.CarreraSemestre.Seccion,
                        CodigoCarrera = j.Jugador.CarreraSemestre.CodigoCarrera,
                        FechaNacimiento = j.Jugador.FechaNacimiento,
                        Edad = j.Jugador.Edad,
                        Telefono = j.Jugador.Telefono,
                        asignacion = new JugadorDTO.JugadorEquipoDTO
                        {
                            PosicionId = j.PosicionId,
                            PosicionName = j.Posicion.Nombre,
                            Dorsal = j.Dorsal,
                            EquipoId = j.EquipoId,
                            Estado = j.Estado
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync(); // Cambiado de `ToListAsync()` si solo quieres un resultado

            return resultado;
        }



        public async Task<List<RegistrationTournamentsDTO.GetRegistrationDTO>> GetInscripcionesBySubTorneo(int subTorneo)
        {
            var listado = await _appDbContext.Inscripcions
                .Where(i => i.Estado != Inscripcion.EstadosInscripcion.Aprobada
                         && i.Estado != Inscripcion.EstadosInscripcion.Cancelada
                         && i.Estado != Inscripcion.EstadosInscripcion.Rechazada)
                .Select(i => new RegistrationTournamentsDTO.GetRegistrationDTO
                {
                    InscripcionId = i.InscripcionId,
                    PreInscripcionId = i.PreInscripcionId,
                    Codigo = i.PreInscripcion.Codigo ?? "No encontrado",
                    EquipoId = i.EquipoId,
                    NombreEquipo = i.Equipo.Nombre,
                    Estado = i.Estado.ToString(),
                    FechaInscripcion = i.FechaInscripcion,
                    subTorneoId = i.SubTorneoId,
                    Descripcion = "Prueba",

                    NombreCapitan = (from c in _appDbContext.Capitans
                                     join j in _appDbContext.Jugadors on c.JugadorId equals j.JugadorId
                                     join je in _appDbContext.JugadorEquipos on j.JugadorId equals je.JugadorId
                                     where je.EquipoId == i.EquipoId
                                     select j.Nombre + " " + j.Apellido).FirstOrDefault() ?? "No encontrado",

                    CorreoCapitan = (from c in _appDbContext.Capitans
                                     join j in _appDbContext.Jugadors on c.JugadorId equals j.JugadorId
                                     join je in _appDbContext.JugadorEquipos on j.JugadorId equals je.JugadorId
                                     where je.EquipoId == i.EquipoId
                                     select c.CorreoElectronico).FirstOrDefault() ?? "No encontrado"
                })
                .ToListAsync();

            return listado;
        }

       // public async Task<RegistrationTournamentsDTO.NewTeamRegistration>
    }

}
