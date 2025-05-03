using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface IPlayerBLL
    {
        List<JugadorDTO.VerifyPlayers> VerificacionJugadores(List<int> carnets);
    }
}
