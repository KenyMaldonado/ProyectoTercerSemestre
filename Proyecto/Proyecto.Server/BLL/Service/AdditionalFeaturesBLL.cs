using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.BLL.Repository;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;

namespace Proyecto.Server.BLL.Service
{
    public class AdditionalFeaturesBLL : IAdditionalFeaturesBLL
    {
        private readonly IAdditionalFeaturesRepository _additionalFeaturesRepository;
        private readonly IConfiguration _configuration;

        public AdditionalFeaturesBLL (IAdditionalFeaturesRepository additionalFeaturesRepository, IConfiguration configuration)
        {
            _additionalFeaturesRepository = additionalFeaturesRepository;
            _configuration = configuration;
        }

        public async Task<int> CreateNews(AdditionalFeaturesDTO.NewsDTO NewNews)
        {
            try
            {
                return await _additionalFeaturesRepository.CreateNews(NewNews);
            }
            catch (Exception ex)
            {
                throw new CustomException("Error al crear la noticia", 500);
            }
        }

        public async Task UpdateNews(AdditionalFeaturesDTO.NewsDTO datosNuevos)
        {
            try
            {
                await _additionalFeaturesRepository.UpdateNews(datosNuevos, true);
            }
            catch (KeyNotFoundException ex)
            {
                throw new CustomException(ex.Message, 404);
            }
            catch (Exception ex)
            {
                throw new CustomException("Error al actualizar la noticia", 500);
            }
        }

        public async Task UpdateLinkNews(AdditionalFeaturesDTO.NewsDTO datosNuevos)
        {
            try
            {
                await _additionalFeaturesRepository.UpdateNews(datosNuevos, false);
            }
            catch (KeyNotFoundException ex)
            {
                throw new CustomException(ex.Message, 404);
            }
            catch (Exception ex)
            {
                throw new CustomException("Error al guardar la fotografía de la noticia", 500);
            }
        }
    
        public async Task UpdateVisibleNews(int NoticiaId)
        {
            await _additionalFeaturesRepository.UpdateVisibleNews(NoticiaId);
        }

        public async Task DeleteNoticia(int NoticiaId)
        {
            await _additionalFeaturesRepository.DeleteNoticia(NoticiaId);
        }

        public async Task<List<AdditionalFeaturesDTO.GetNewsDTO>> GetNews()
        {
            return await _additionalFeaturesRepository.GetNoticas();
        }
    }
}
