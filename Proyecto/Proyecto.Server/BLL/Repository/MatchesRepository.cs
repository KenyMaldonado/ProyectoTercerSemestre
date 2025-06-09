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
    }
}
