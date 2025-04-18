using System.Data;
using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;

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

        public async Task<List<TournamentDTO.TypeOfTournament>> GetTournaments()
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
                    {"",tournament.FechaFin }
                };
            }
            catch (Exception ex) 
            { 
            }
        }
    }
}
