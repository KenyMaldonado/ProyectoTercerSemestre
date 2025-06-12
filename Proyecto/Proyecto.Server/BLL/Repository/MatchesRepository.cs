using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;
using static Proyecto.Server.DTOs.MatchesDTO;
using static Proyecto.Server.DTOs.ResultadoDTO;

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


        public async Task<List<Jornada>> GetJornadasWithPartidosAndDetailsBySubtorneoAsync(int subtorneoId, int rol, int usuarioId)
        {
            // Primero, filtramos los partidos según condiciones:
            // - Que pertenezcan al subtorneo por Equipo1 o Equipo2
            // - Y si no es admin, que el partido esté asignado al usuario con rol 2 (árbitro)
            var partidosQuery = _appContext.Partidos
                .Where(p =>
                    ((p.Equipo1Navigation != null && p.Equipo1Navigation.SubTorneoId == subtorneoId) ||
                     (p.Equipo2Navigation != null && p.Equipo2Navigation.SubTorneoId == subtorneoId)) &&
                    (rol == 1 || (p.UsuarioId == usuarioId && p.Usuario.RolId == 2))
                )
                .Include(p => p.Equipo1Navigation)
                    .ThenInclude(e => e.Facultad)
                .Include(p => p.Equipo2Navigation)
                    .ThenInclude(e => e.Facultad)
                .Include(p => p.Usuario)
                .Include(p => p.Cancha);

            // Luego, agrupamos los partidos por Jornada (puede ser null, se filtra)
            var jornadas = await partidosQuery
                .Where(p => p.Jornada != null)
                .GroupBy(p => p.Jornada!)
                .Select(g => g.Key)
                .OrderBy(j => j.NumeroJornada)
                .ToListAsync();

            // Finalmente, para cada jornada cargamos los partidos filtrados que corresponden
            // (Ya tenemos la lista de jornadas con partidos filtrados)
            foreach (var jornada in jornadas)
            {
                // Cargamos los partidos para esa jornada con el mismo filtro (por seguridad)
                jornada.Partidos = await partidosQuery
                    .Where(p => p.JornadaId == jornada.JornadaId)
                    .ToListAsync();
            }

            return jornadas;
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

        public async Task<List<TablaPosicionesDto>> ObtenerTablaPosicionesAsync(int subTorneoId)
        {
            var equipos = await _appContext.Equipos
                .Where(e => e.SubTorneoId == subTorneoId && e.SubTorneo.Estado == "EnCurso")
                .Select(e => new
                {
                    e.EquipoId,
                    e.Nombre,
                    e.ImagenEquipo
                })
                .ToListAsync();

            var resultados = await _appContext.ResultadoPartidos
                .Include(r => r.Partido)
                .Where(r => r.Partido.Equipo1.HasValue && r.Partido.Equipo2.HasValue)
                .ToListAsync();

            var tabla = new List<TablaPosicionesDto>();

            foreach (var equipo in equipos)
            {
                var partidos = resultados.Where(r =>
                    r.Partido.Equipo1 == equipo.EquipoId || r.Partido.Equipo2 == equipo.EquipoId);

                int puntos = 0, ganados = 0, empatados = 0, perdidos = 0;
                int golesFavor = 0, golesContra = 0;

                foreach (var partido in partidos)
                {
                    bool esEquipo1 = partido.Partido.Equipo1 == equipo.EquipoId;

                    int golesPropios = esEquipo1 ? partido.GolesEquipo1 : partido.GolesEquipo2;
                    int golesRivales = esEquipo1 ? partido.GolesEquipo2 : partido.GolesEquipo1;

                    golesFavor += golesPropios;
                    golesContra += golesRivales;

                    if (golesPropios > golesRivales)
                    {
                        puntos += 3;
                        ganados++;
                    }
                    else if (golesPropios == golesRivales)
                    {
                        puntos += 1;
                        empatados++;
                    }
                    else
                    {
                        perdidos++;
                    }
                }

                tabla.Add(new TablaPosicionesDto
                {
                    EquipoId = equipo.EquipoId,
                    NombreEquipo = equipo.Nombre,
                    URLImagenEquipo = equipo.ImagenEquipo,
                    Puntos = puntos,
                    PartidosJugados = ganados + empatados + perdidos,
                    PartidosGanados = ganados,
                    PartidosEmpatados = empatados,
                    PartidosPerdidos = perdidos,
                    GolesAFavor = golesFavor,
                    GolesEnContra = golesContra,
                    DiferenciaGoles = golesFavor - golesContra
                });
            }

            return tabla
                .OrderByDescending(t => t.Puntos)
                .ThenByDescending(t => t.DiferenciaGoles)
                .ThenByDescending(t => t.GolesAFavor)
                .ToList();
        }

        public async Task<bool> AsignarArbitroPartido(int idArbitro, int partidoId)
        {
            var partido = await _appContext.Partidos.FindAsync(partidoId);

            if (partido == null)
                return false; // No se encontró el partido

            // Buscar si el árbitro ya tiene un partido en el mismo día y hora
            bool conflicto = await _appContext.Partidos.AnyAsync(p =>
                p.PartidoId != partidoId &&               // Excluir el mismo partido
                p.UsuarioId == idArbitro &&              // Mismo árbitro
                p.FechaPartido.Date == partido.FechaPartido.Date && // Mismo día
                p.HoraPartido == partido.HoraPartido     // Misma hora exacta
            );

            if (conflicto)
                return false; // El árbitro ya está ocupado en ese horario

            // Asignar árbitro
            partido.UsuarioId = idArbitro;
            _appContext.Partidos.Update(partido);
            await _appContext.SaveChangesAsync();

            return true;
        }

        public async Task<ResultadoPartido> CrearResultadoPartidoAsync(ResultadoPartido resultado)
        {
            _appContext.ResultadoPartidos.Add(resultado);
            await _appContext.SaveChangesAsync();
            return resultado;
        }

        public async Task AgregarGolesAsync(List<Goles> goles)
        {
            await _appContext.Goles.AddRangeAsync(goles);
            await _appContext.SaveChangesAsync();
        }

        public async Task AgregarTarjetasAsync(List<Tarjeta> tarjetas)
        {
            await _appContext.Tarjeta.AddRangeAsync(tarjetas);
            await _appContext.SaveChangesAsync();
        }

        public async Task<Jugador?> ObtenerJugadorPorIdAsync(int jugadorId)
        {
            return await _appContext.Jugadors.FindAsync(jugadorId);
        }

        public async Task ActualizarEstadoJugadorAsync(int jugadorId, Jugador.EstadoJugador nuevoEstado)
        {
            var jugador = await _appContext.Jugadors.FindAsync(jugadorId);
            if (jugador != null)
            {
                jugador.Estado = nuevoEstado;
                await _appContext.SaveChangesAsync();
            }
        }

        public async Task ActualizarGolesResultadoAsync(int resultadoId, int golesEq1, int golesEq2)
        {
            try
            {
                var resultado = await _appContext.ResultadoPartidos.FindAsync(resultadoId);
                if (resultado == null)
                    throw new Exception($"ResultadoPartido con ID {resultadoId} no encontrado.");

                resultado.GolesEquipo1 = golesEq1;
                resultado.GolesEquipo2 = golesEq2;
                await _appContext.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception("Error al guardar los goles en la base de datos. Detalles: " + dbEx.InnerException?.Message ?? dbEx.Message, dbEx);
            }
            catch (Exception ex)
            {
                throw new Exception("Error inesperado al actualizar los goles: " + ex.Message, ex);
            }
        }

        public async Task<Partido?> ObtenerPartidoConJugadoresAsync(int resultadoId)
        {
            try
            {
                var partido = await _appContext.ResultadoPartidos
                    .Where(r => r.ResultadoPartidoId == resultadoId)
                    .Select(r => r.Partido)
                    .FirstOrDefaultAsync();

                if (partido == null)
                    throw new Exception($"No se encontró el partido asociado al ResultadoPartidoId {resultadoId}");

                return partido;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el partido con jugadores: " + ex.Message, ex);
            }
        }

        public async Task<int?> ObtenerEquipoDeJugadorAsync(int jugadorId)
        {
            try
            {
                var equipoId = await _appContext.JugadorEquipos
                    .Where(je => je.JugadorId == jugadorId && je.Estado)
                    .Select(je => (int?)je.EquipoId)
                    .FirstOrDefaultAsync();

                if (!equipoId.HasValue)
                    throw new Exception($"No se encontró equipo activo para el jugador con ID {jugadorId}");

                return equipoId;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el equipo del jugador: " + ex.Message, ex);
            }
        }

        public async Task ActualizarEstadoPartido(int partidoID)
        {
            var partido = await _appContext.Partidos
                          .FirstOrDefaultAsync(p => p.PartidoId == partidoID);
            partido.Estado = "Finalizado";
            await _appContext.SaveChangesAsync();
        }

        public async Task<List<PartidoDetalladoDTO>> GetResultadosDetalladosPartidosBySubtorneo(int subtorneoId)
        {
            var partidos = await _appContext.Partidos
                .Where(p =>
                    p.Estado == "Finalizado" &&
                    ((p.Equipo1Navigation != null && p.Equipo1Navigation.SubTorneoId == subtorneoId) ||
                     (p.Equipo2Navigation != null && p.Equipo2Navigation.SubTorneoId == subtorneoId)))
                .Include(p => p.Equipo1Navigation)
                .Include(p => p.Equipo2Navigation)
                .Include(p => p.ResultadoPartidos)
                    .ThenInclude(rp => rp.Goles)
                        .ThenInclude(g => g.Jugador)
                .Include(p => p.ResultadoPartidos)
                    .ThenInclude(rp => rp.Goles)
                        .ThenInclude(g => g.TipoGol)
                .Include(p => p.ResultadoPartidos)
                    .ThenInclude(rp => rp.Tarjeta)
                        .ThenInclude(t => t.Jugador)
                .OrderBy(p => p.FechaPartido)
                .ToListAsync();

            var lista = partidos.Select(p => {
                var resultado = p.ResultadoPartidos.FirstOrDefault();

                return new PartidoDetalladoDTO
                {
                    PartidoId = p.PartidoId,
                    FechaPartido = p.FechaPartido,
                    HoraPartido = p.HoraPartido,
                    Estado = p.Estado,
                    Equipo1Nombre = p.Equipo1Navigation?.Nombre ?? "Por definir",
                    Equipo2Nombre = p.Equipo2Navigation?.Nombre ?? "Por definir",
                    GolesEquipo1 = resultado?.GolesEquipo1 ?? 0,
                    GolesEquipo2 = resultado?.GolesEquipo2 ?? 0,
                    Goles = resultado?.Goles.Select(g => new ResultadoDTO.GolDTO
                    {
                        MinutoGol = g.MinutoGol ?? 0,
                        EsTiempoExtra = g.EsTiempoExtra,
                        OrdenPenal = g.OrdenPenal,
                        JugadorNombre = $"{g.Jugador.Nombre} {g.Jugador.Apellido}",
                        ImagenJugador = g.Jugador.Fotografia ?? "", // Asegúrate que exista este campo en la entidad Jugador
                        TipoGol = g.TipoGol.Nombre
                    }).ToList() ?? new(),
                    Tarjetas = resultado?.Tarjeta.Select(t => new ResultadoDTO.TarjetaDTO
                    {
                        MinutoTarjeta = t.MinutoTarjeta,
                        TipoTarjeta = t.TipoTarjeta,
                        Descripcion = t.Descripcion,
                        JugadorNombre = $"{t.Jugador.Nombre} {t.Jugador.Apellido}"
                    }).ToList() ?? new()
                };
            }).ToList();

            return lista;
        }

    }
}
