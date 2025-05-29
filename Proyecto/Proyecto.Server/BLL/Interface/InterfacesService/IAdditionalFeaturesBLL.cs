using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface IAdditionalFeaturesBLL
    {
        Task<int> CreateNews(AdditionalFeaturesDTO.NewsDTO NewNews);
        Task UpdateLinkNews(AdditionalFeaturesDTO.NewsDTO datosNuevos);
        Task UpdateNews(AdditionalFeaturesDTO.NewsDTO datosNuevos);
        Task UpdateVisibleNews(int NoticiaId);
        Task DeleteNoticia(int NoticiaId);
        Task<List<AdditionalFeaturesDTO.GetNewsDTO>> GetNews();
    }
}
