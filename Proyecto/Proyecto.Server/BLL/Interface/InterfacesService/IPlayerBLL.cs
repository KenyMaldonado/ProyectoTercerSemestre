using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface IPlayerBLL
    {
        List<JugadorDTO.VerifyPlayers> VerificacionJugadores(List<int> carnets);
        List<JugadorDTO> GetJugadoresByTeam(int TeamId);
        Task<List<JugadorDTO.PosicionJugadorDTO>> GetPosicionesJugadores();
        Task<PagedResultDTO<JugadorDTO>> GetPlayers(int pagina, int tamañoPagina);
        Task UpdateJugador(string linkNuevo, int jugadorId, JugadorDTO.UpdateJugadorDTO datos);
        Task<List<JugadorDTO>> SearchPlayers(string query);
    }
}
