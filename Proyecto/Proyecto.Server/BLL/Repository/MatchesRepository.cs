using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;

namespace Proyecto.Server.BLL.Repository
{
    public class MatchesRepository : IMatchesRepository
    {
        private readonly AppDbContext _appContext;

        public MatchesRepository(AppDbContext appContext)
        {
            _appContext = appContext;
        }

        public async Task<List<MatchesDTO.CanchaDTO>> GetCanchas()
        {
            var Listado = await _appContext.Canchas
                                .Where(c => c.Estado != "Eliminado")
                                .Select(c => new MatchesDTO.CanchaDTO
                                {
                                    CanchaId = c.CanchaId,
                                    Nombre = c.Nombre,
                                    Capacidad = c.Capacidad,
                                    Estado = c.Estado
                                })
                                .ToListAsync();
            return Listado;
        }

        public async Task UpdateCancha(MatchesDTO.CanchaDTO datos)
        {
            var cancha = await _appContext.Canchas
                        .FirstOrDefaultAsync(c => c.CanchaId == datos.CanchaId);
            if (cancha == null)
                throw new CustomException("No se encontro ninguna cancha con ese ID", 404);

            cancha.Nombre = datos.Nombre;
            cancha.Capacidad = datos.Capacidad;
            cancha.Estado = datos.Estado;
            await _appContext.SaveChangesAsync();
        }

        public async Task DeleteCancha(int canchaID)
        {
            var cancha = await _appContext.Canchas
                        .FirstOrDefaultAsync(c => c.CanchaId == canchaID);
            if (cancha == null)
                throw new CustomException("No se encontro ninguna cancha con ese ID", 404);

            cancha.Estado = "Eliminado";
            await _appContext.SaveChangesAsync();
        }

        public async Task CreateCancha(MatchesDTO.CanchaDTO datos)
        {
            Cancha canchaNueva = new Cancha
            {
                Nombre = datos.Nombre,
                Capacidad = datos.Capacidad,
                Estado = "Disponible"
            };

            _appContext.Canchas.Add(canchaNueva);
            await _appContext.SaveChangesAsync();
        }

        public async Task<Torneo?> GetTorneoBySubtorneoAsync(int subtorneoId)
        {
            return await _appContext.SubTorneos
                .Where(s => s.SubTorneoId == subtorneoId)
                .Select(s => s.Torneo)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Cancha>> GetCanchasDisponiblesAsync()
        {
            return await _appContext.Canchas
                .Where(c => c.Estado == "Disponible")
                .ToListAsync();
        }

        public async Task<List<Usuario>> GetArbitrosDisponiblesAsync(DateTime fecha, TimeOnly hora)
        {
            return await _appContext.Usuarios
                .Where(u => u.Rol.Nombre.ToLower() == "arbitro" &&
                            u.Estado == Usuario.EstadoUsuario.Activo &&
                            !_appContext.Partidos.Any(p => p.UsuarioId == u.UsuarioId
                                                    && p.FechaPartido == fecha
                                                    && p.HoraPartido == hora))
                .ToListAsync();
        }

        public async Task<bool> IsCanchaDisponibleAsync(int canchaId, DateTime fecha, TimeOnly hora)
        {
            return !await _appContext.Partidos.AnyAsync(p => p.CanchaId == canchaId
                                                        && p.FechaPartido == fecha
                                                        && p.HoraPartido == hora);
        }

        public async Task CrearJornadaAsync(Jornada jornada)
        {
            await _appContext.Jornada.AddAsync(jornada);
        }

        public async Task CrearPartidoAsync(Partido partido)
        {
            await _appContext.Partidos.AddAsync(partido);
        }

        public async Task GuardarCambiosAsync()
        {
            await _appContext.SaveChangesAsync();
        }
        public async Task<List<Usuario>> GetArbitrosDisponiblesGeneralAsync()
        {
            return await _appContext.Usuarios
                .Where(u => u.Rol.Nombre.ToLower() == "arbitro" &&
                            u.Estado == Usuario.EstadoUsuario.Activo)
                .ToListAsync();
        }

        public async Task<bool> IsArbitroOcupadoAsync(int arbitroId, DateTime fecha, TimeOnly hora)
        {
            return await _appContext.Partidos.AnyAsync(p => p.UsuarioId == arbitroId
                                                            && p.FechaPartido == fecha
                                                            && p.HoraPartido == hora);
        }

        public async Task<List<Partido>> GetPartidosProgramadosEnRangoAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            return await _appContext.Partidos
                .Where(p => p.FechaPartido >= fechaInicio && p.FechaPartido <= fechaFin)
                .ToListAsync();
        }

        // Implementación del nuevo método para inserción masiva
        public async Task CrearJornadasYPartidosAsync(List<Jornada> jornadas, List<Partido> partidos)
        {
            await _appContext.Jornada.AddRangeAsync(jornadas);
            await _appContext.Partidos.AddRangeAsync(partidos);
            await _appContext.SaveChangesAsync();
        }


        public async Task<List<Jornada>> GetJornadasWithPartidosAndDetailsBySubtorneoAsync(int subtorneoId)
        {
            return await _appContext.Jornada
                .Include(jornada => jornada.Partidos)
                    .ThenInclude(partido => partido.Equipo1Navigation)
                        .ThenInclude(equipo => equipo.Facultad)
                .Include(jornada => jornada.Partidos)
                    .ThenInclude(partido => partido.Equipo2Navigation)
                        .ThenInclude(equipo => equipo.Facultad)
                .Include(jornada => jornada.Partidos)
                    .ThenInclude(partido => partido.Usuario)
                .Include(jornada => jornada.Partidos)
                    .ThenInclude(partido => partido.Cancha)
                .Where(jornada => jornada.Partidos.Any(p =>
                    (p.Equipo1Navigation != null && p.Equipo1Navigation.SubTorneoId == subtorneoId) ||
                    (p.Equipo2Navigation != null && p.Equipo2Navigation.SubTorneoId == subtorneoId)
                ))
                .OrderBy(jornada => jornada.NumeroJornada)
                .ToListAsync();
        }

        public async Task UpdateEstadoSubtorneo(int subtorneoID)
        {
            var subtorneo = await _appContext.SubTorneos
                            .FirstOrDefaultAsync(s => s.SubTorneoId == subtorneoID);

            if (subtorneo == null)
            {
                throw new CustomException("Error al cambiar el estado: no se encontro el subtorneo", 404);
            }
            else
            {
                subtorneo.Estado = "EnCurso";
            }

            await _appContext.SaveChangesAsync();
        }


    }
}
