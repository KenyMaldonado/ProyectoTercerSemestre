using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Repository
{
    public class TournamentRepository
    {
        private readonly StoreProcedure _storeProcedure;
        private readonly AppDbContext _appDbContext;

        public TournamentRepository (StoreProcedure storeProcedure, AppDbContext appDbContext)
        {
            _storeProcedure = storeProcedure;
            _appDbContext = appDbContext;
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
