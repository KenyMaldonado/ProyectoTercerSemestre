using System.Data;
using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using ZstdSharp.Unsafe;

namespace Proyecto.Server.BLL.Repository
{
    public class TournamentRepository : ITournamentRepository
    {
        private readonly StoreProcedure _storeProcedure;
        private readonly AppDbContext _appDbContext;

        public TournamentRepository (StoreProcedure storeProcedure, AppDbContext appDbContext)
        {
            _storeProcedure = storeProcedure;
            _appDbContext = appDbContext;
        }

        public async Task<List<TournamentDTO.TypeOfTournament>> GetTypesTournaments()
        {
            var TiposTorneo = await _appDbContext.TipoTorneos
                .Select(t => new TournamentDTO.TypeOfTournament
                {
                    TipoTorneoId = t.TipoTorneoId,
                    NombreTipoTorneo = t.Nombre,
                    DescripcionTipoTorneo = t.Descripcion
                })
                .ToListAsync();
            return TiposTorneo;
        } 

        public async Task CreateNewTournament(TournamentDTO.CreateTournamenteParameter tournament)
        {
            try
            {
                var nuevoTorneo = new Torneo
                {
                    Nombre = tournament.Nombre,
                    FechaInicio = tournament.FechaInicio,
                    FechaFin = tournament.FechaFin,
                    Descripcion = tournament.Descripcion,
                    BasesTorneo = tournament.BasesTorneo,
                    FechaInicioInscripcion = tournament.FechaInicioInscripcion,
                    FechaFinInscripcion = tournament.FechaFinInscripcion,
                    UsuarioId = tournament.UsuarioIDCreo,
                    TipoTorneoId = tournament.TipoTorneoID,
                    TipoJuegoId = tournament.TipoJuegoID
                };

                _appDbContext.Torneos.Add(nuevoTorneo);
                await _appDbContext.SaveChangesAsync();

                if (tournament.Subtorneos != null && tournament.Subtorneos.Any())
                {
                    foreach (var sub in tournament.Subtorneos)
                    {
                        var nuevoSubtorneo = new SubTorneo
                        {
                            TorneoId = nuevoTorneo.TorneoId,  
                            Categoria = sub.categoria,
                            CantidadEquipos = sub.cantidadEquipos
                        };

                        _appDbContext.SubTorneos.Add(nuevoSubtorneo);
                    }

                    // Guardar todos los subtorneos
                    await _appDbContext.SaveChangesAsync();
                }

            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear el torneo: " + ex.Message);
            }
        }


        public async Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments()
        {
            var consulta = await (from t in _appDbContext.Torneos 
                                  join tt in _appDbContext.TipoTorneos on t.TipoTorneoId equals tt.TipoTorneoId
                                  join u in _appDbContext.Usuarios on t.UsuarioId equals u.UsuarioId
                                  join tj in _appDbContext.TipoJuegoTorneos on t.TipoJuegoId equals tj.TipoJuegoId
                                  join um in _appDbContext.Usuarios on t.UsuarioModifico equals um.UsuarioId into UmGroup
                                  from um in UmGroup.DefaultIfEmpty()
                                  where t.Estado != Torneo.EstadoTorneo.Eliminado
                                  select new TournamentDTO.GetTournamentDTO
                                  {
                                      TorneoId = t.TorneoId,
                                      Nombre = t.Nombre,
                                      FechaInicio = t.FechaInicio,
                                      FechaFin = t.FechaFin,
                                      Descripcion = t.Descripcion,
                                      BasesTorneo = t.BasesTorneo,
                                      FechaInicioInscripcion = t.FechaInicioInscripcion,
                                      FechaFinInscripcion = t.FechaFinInscripcion,
                                      UsuarioId = t.UsuarioId,
                                      NameUsuario = u.Nombre + " " + u.Apellido,
                                      TipoTorneoId = t.TipoTorneoId,
                                      NameTipoTorneo = tt.Nombre,
                                      Estado = (TournamentDTO.EstadoTorneo)t.Estado,
                                      TipoJuegoId = t.TipoJuegoId,
                                      NameTipoJuego = tj.Nombre,
                                      UserModifyId = t.UsuarioModifico,
                                      NameUserModify = um != null ? um.Nombre + " " + um.Apellido : "No modificado",
                                      FechaModificacion = t.FechaModificacion

                                  }).ToListAsync();
            return consulta;
        }

        public async Task<List<TournamentDTO.GetSubTournamentDTO>> GetSubTournaments(int TournamentID)
        {
            var consulta = await (from st in _appDbContext.SubTorneos
                                  where st.TorneoId == TournamentID
                                  select new TournamentDTO.GetSubTournamentDTO
                                  {
                                      SubTorneoId = st.SubTorneoId,
                                      Categoria = st.Categoria,
                                      TorneoId = st.TorneoId,
                                      Estado = st.Estado,
                                      CantidadEquipos = st.CantidadEquipos
                                  }).ToListAsync();
            return consulta;
        }
       

        public async Task<List<TournamentDTO.TournamentGameTypes>> GetTournamentGameTypes()
        {
            var consulta = await (_appDbContext.TipoJuegoTorneos.Select(x => new TournamentDTO.TournamentGameTypes
            {
                TipoJuegoId = x.TipoJuegoId,
                Nombre = x.Nombre,
                CantidadJugadores = x.CantidadJugadores,
                Descripcion = x.Descripcion,

            }).ToListAsync()); 

            return consulta;
        }

        public async Task<int> GetLastIDTournaments()
        {
            try
            {
                var lastTournament = await _appDbContext.Torneos
                    .OrderByDescending(t => t.TorneoId) 
                    .FirstOrDefaultAsync();

                // Verificar si se encontró un torneo
                if (lastTournament == null)
                    return 0; // Si no hay registros, devolver 0

                return lastTournament.TorneoId; // Devolver el último ID encontrado
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener el último ID: {ex.Message}");
                return -1; 
            }
        }

        public void UpdateLinkBasesTorneo(int torneoId, string linkNuevo)
        {
            // Buscar el torneo directamente con FirstOrDefault
            var torneo = _appDbContext.Torneos.FirstOrDefault(t => t.TorneoId == torneoId);

            // Verificar si el torneo existe antes de intentar actualizar
            if (torneo != null)
            {
                torneo.BasesTorneo = linkNuevo;
                _appDbContext.SaveChanges();
            }
            else
            {
                throw new Exception(("Error al encontrar el torneo"));
            }
        }

        public async Task UpdateTournament(TournamentDTO.UpdateTournamentDTO torneoModify, int usuarioModificoId)
        {
            var horaGuatemala = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time"));
            var torneo = await _appDbContext.Torneos
                         .Where(t => t.TorneoId == torneoModify.TorneoId)
                         .FirstOrDefaultAsync();

            if (torneo == null)
                throw new KeyNotFoundException("El torneo no fue encontrado.");

            torneo.Nombre = torneoModify.Nombre;
            torneo.FechaFinInscripcion = torneoModify.FechaFinInscripcion;
            torneo.FechaInicio = torneoModify.FechaInicio;
            torneo.FechaFin = torneoModify.FechaFin;
            torneo.Descripcion = torneoModify.Descripcion;
            torneo.FechaInicioInscripcion = torneoModify.FechaInicioInscripcion;
            torneo.UsuarioModifico = usuarioModificoId;
            torneo.FechaModificacion = horaGuatemala;

            await _appDbContext.SaveChangesAsync();
        }

        public async Task GetInformationStarTournament()
        {

        }
    }
}
