using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface IMatchesRepository
    {
        Task<List<MatchesDTO.CanchaDTO>> GetCanchas();
        Task UpdateCancha(MatchesDTO.CanchaDTO datos);
        Task CreateCancha(MatchesDTO.CanchaDTO datos);
        Task DeleteCancha(int canchaID);
    }
}
