using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface IMatchesBLL
    {
        Task<List<MatchesDTO.CanchaDTO>> GetCanchas();
        Task UpdateCancha(MatchesDTO.CanchaDTO datos);
        Task DeleteCancha(int CanchaID);
        Task CreateCancha(MatchesDTO.CanchaDTO datosNuevos);
    }
}
