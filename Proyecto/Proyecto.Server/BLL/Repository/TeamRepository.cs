using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Repository
{
    public class TeamRepository : ITeamRepository
    {
        private readonly AppDbContext _appDbContext;

        public TeamRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public async Task<List<EquipoDTO>> GetTeamsBySubtorneo(int subTorneoId, int pageNumber, int pageSize)
        {
            var equipos = await _appDbContext.Equipos
                .Where(e => e.SubTorneoId == subTorneoId)
                .OrderBy(e => e.EquipoId) 
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new EquipoDTO
                {
                    EquipoId = e.EquipoId,
                    Nombre = e.Nombre,
                    ColorUniforme = e.ColorUniforme,
                    ColorUniformeSecundario = e.ColorUniformeSecundario,
                    FacultadId = e.FacultadId,
                    SubTorneoId = e.SubTorneoId,
                    NameFacultad = e.Facultad.Nombre,
                    ImagenEquipo = e.ImagenEquipo
                })
                .ToListAsync();

            return equipos;
        }

        public async Task<int> CountTeamsBySubtorneo(int subTorneoId)
        {
            return await _appDbContext.Equipos
                .Where(e => e.SubTorneoId == subTorneoId)
                .CountAsync();
        }



    }
}
