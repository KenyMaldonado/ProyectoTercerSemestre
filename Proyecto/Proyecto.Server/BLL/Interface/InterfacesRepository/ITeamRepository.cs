using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface ITeamRepository
    {
        Task<List<EquipoDTO>> GetTeamsBySubtorneo(int subTorneoId, int pageNumber, int pageSize);
        Task<int> CountTeamsBySubtorneo(int subTorneoId);
        Task UpdateTeam(EquipoDTO.UpdateTeamDTO datosNuevos);
        void UpdateLinkLogoTeam(int TeamId, string linkNuevo);
    }
}
