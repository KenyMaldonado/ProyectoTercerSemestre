using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface IAdditionalFeaturesRepository
    {
        Task<int> CreateNews(AdditionalFeaturesDTO.NewsDTO NewNews);
        Task UpdateNews(AdditionalFeaturesDTO.NewsDTO datosNuevos, bool IsUpdate);
        Task UpdateVisibleNews(int NewsId);
        Task DeleteNoticia(int NewsId);
        Task<List<AdditionalFeaturesDTO.GetNewsDTO>> GetNoticas();
    }
}
