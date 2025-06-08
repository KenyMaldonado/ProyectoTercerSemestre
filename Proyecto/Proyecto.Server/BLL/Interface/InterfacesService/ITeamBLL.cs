using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface ITeamBLL
    {
        Task<PagedResultDTO<EquipoDTO>> GetPagedTeamsBySubtorneo(int subTorneoId, int pagina, int tamañoPagina);
        Task UpdateEquipo(EquipoDTO.UpdateTeamDTO datosNuevos);
        void UpdateLinkLogoTeam(int TeamId, string linkNuevo);
        Task<List<EquipoDTO.GetTeam>> GetInformacionStartTournamentBySubtorneo(int subTorneo);
    }
}
