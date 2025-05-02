using System.Data;
using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
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

        public void CreateNewTournament(TournamentDTO tournament)
        {
            try
            {
                var parametrosEntrada = new Dictionary<string, object>
                {
                    {"nombre",tournament.Datos.Nombre },
                    {"fechaInicio", tournament.Datos.FechaInicio.ToString("yyyy-MM-dd") },
                    {"fechaFin",tournament.Datos.FechaFin.ToString("yyyy-MM-dd") },
                    {"descripcion",tournament.Datos.Descripcion},
                    {"bases",tournament.Datos.BasesTorneo},
                    {"fechaInicioInscripcion", tournament.Datos.FechaInicioInscripcion.ToString("yyyy-MM-dd")},
                    {"fechaFinInscripcion", tournament.Datos.FechaFinInscripcion.ToString("yyyy-MM-dd")},
                    {"cantidadParticipantes", tournament.Datos.CantidadParticipantes },
                    {"usuarioCreo", tournament.UsuarioId},
                    {"tipoTorneo",tournament.Datos.TipoTorneoID},
                    {"ramas",tournament.Datos.Ramas }
                };

                _storeProcedure.EjecutarProcedimientoAlmacenado("sp_CreateNewTournament", CommandType.StoredProcedure, parametrosEntrada);
            }
            catch (Exception ex) 
            {
                throw new Exception("Error, no se registro el nuevo torneo correctamente" + ex.Message);
            }
        }

        public async Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments()
        {
            var consulta = await (from t in _appDbContext.Torneos 
                                  join tt in _appDbContext.TipoTorneos on t.TipoTorneoId equals tt.TipoTorneoId
                                  join u in _appDbContext.Usuarios on t.UsuarioId equals u.UsuarioId
                                  join tj in _appDbContext.TipoJuegoTorneos on t.TipoJuegoId equals tj.TipoJuegoId
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
                                      NameTipoJuego = tj.Nombre
                                  }).ToListAsync();
            return consulta;
        }

        public async Task<List<TournamentDTO.GetSubTournamentDTO>> GetSubTournaments(int TournamentID)
        {
            var consulta = await (from st in _appDbContext.SubTorneos
                                  select new TournamentDTO.GetSubTournamentDTO
                                  {
                                      SubTorneoId = st.SubTorneoId,
                                      Categoria = st.Categoria,
                                      TorneoId = st.TorneoId,
                                      Estado = (TournamentDTO.EstadoSubTorneo)st.Estado,
                                      CantidadEquipos = st.CantidadEquipos
                                  }).ToListAsync();
            return consulta;
        }
       
        
    }
}
