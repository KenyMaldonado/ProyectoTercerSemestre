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
                    ImagenEquipo = e.ImagenEquipo,
                    NameTournament = e.SubTorneo.Torneo.Nombre,
                    NameSubTournament = e.SubTorneo.Categoria,
                    Estado = (EquipoDTO.EstadoEquipo)e.Estado
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

        public async Task UpdateTeam(EquipoDTO.UpdateTeamDTO datosNuevos)
        {
            var team = await _appDbContext.Equipos
                        .Where(e => e.EquipoId == datosNuevos.EquipoId)
                        .FirstOrDefaultAsync();
            if (team == null)
                throw new KeyNotFoundException("El equipo no fue encontrado.");

            team.Nombre = datosNuevos.Nombre;
            team.ColorUniforme = datosNuevos.ColorUniforme;
            team.ColorUniformeSecundario = datosNuevos.ColorUniformeSecundario;
            await _appDbContext.SaveChangesAsync();
        }

        public void UpdateLinkLogoTeam(int TeamId, string linkNuevo)
        {
            // Buscar el torneo directamente con FirstOrDefault
            var torneo = _appDbContext.Equipos.FirstOrDefault(e => e.EquipoId == TeamId);

  
            if (torneo != null)
            {
                torneo.ImagenEquipo = linkNuevo;
                _appDbContext.SaveChanges();
            }
            else
            {
                throw new Exception(("Error al encontrar el Equipo"));
            }
        }


    }
}
