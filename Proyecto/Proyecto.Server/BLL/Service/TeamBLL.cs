using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Service
{
    public class TeamBLL: ITeamBLL
    {
        public readonly ITeamRepository teamRepository;

        public TeamBLL(ITeamRepository teamRepository)
        {
            this.teamRepository = teamRepository;
        }

        public async Task<PagedResultDTO<EquipoDTO>> GetPagedTeamsBySubtorneo(int subTorneoId, int pagina, int tamañoPagina)
        {
            var totalEquipos = await teamRepository.CountTeamsBySubtorneo(subTorneoId);

            int totalPaginas = (int)Math.Ceiling((double)totalEquipos / tamañoPagina);

            var equipos = await teamRepository.GetTeamsBySubtorneo(subTorneoId, pagina, tamañoPagina);

            return new PagedResultDTO<EquipoDTO>
            {
                Items = equipos,
                TotalPages = totalPaginas,
                CurrentPage = pagina,
                PageSize = tamañoPagina,
                TotalItems = totalEquipos
            };
        }

        public async Task UpdateEquipo(EquipoDTO.UpdateTeamDTO datosNuevos)
        {
            await teamRepository.UpdateTeam(datosNuevos);
        }

        public void UpdateLinkLogoTeam(int TeamId, string linkNuevo)
        {
            teamRepository.UpdateLinkLogoTeam(TeamId, linkNuevo);
        }
    }
}
