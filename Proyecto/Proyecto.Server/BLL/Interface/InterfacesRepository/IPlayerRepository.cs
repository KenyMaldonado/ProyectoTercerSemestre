using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface IPlayerRepository
    {
        List<JugadorDTO.VerifyPlayers> VerifyPlayers(List<int> carnets);
        List<JugadorDTO> GetJugadoresByTeam(int TeamId);
        Task<List<JugadorDTO.PosicionJugadorDTO>> GetPosicionesJugadores();
        Task<List<JugadorDTO>> GetPLayers(int pageNumber, int pageSize);
        Task<int> CountPlayers();
    }
}
