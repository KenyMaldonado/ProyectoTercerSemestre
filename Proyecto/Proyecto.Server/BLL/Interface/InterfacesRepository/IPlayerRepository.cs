using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface IPlayerRepository
    {
        List<JugadorDTO.VerifyPlayers> VerifyPlayers(List<int> carnets);
    }
}
