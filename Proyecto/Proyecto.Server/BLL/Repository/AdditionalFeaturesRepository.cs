using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Repository
{
    public class AdditionalFeaturesRepository : IAdditionalFeaturesRepository
    {
        private readonly AppDbContext _appDbContext;

        public AdditionalFeaturesRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public async Task<int> CreateNews (AdditionalFeaturesDTO.NewsDTO NewNews)
        {
            var guatemalaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time");
            var guatemalaTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, guatemalaTimeZone);

            var news = new Noticia
            {
                Titulo = NewNews.Title,
                Contenido = NewNews.Content,
                Publicado = NewNews.Published,
                FechaCreacion = guatemalaTime,
                UsuarioId = NewNews.CreateByUserID
            };

            _appDbContext.Noticia.Add(news);
            await _appDbContext.SaveChangesAsync();
            
            return news.IdNoticia;
        }

        public async Task UpdateNews(AdditionalFeaturesDTO.NewsDTO datosNuevos, bool IsUpdate)
        {
            var News = await _appDbContext.Noticia
                        .Where(n => n.IdNoticia == datosNuevos.NewsId)
                        .FirstOrDefaultAsync();
            if (News == null)
                throw new KeyNotFoundException("La noticia no fue encontrada.");

            if (IsUpdate)
            {
                News.Titulo = datosNuevos.Title;
                News.Contenido = datosNuevos.Content;
                if(datosNuevos.ImageUrl == null)
                {
                    News.ImagenUrl = datosNuevos.ImageUrl;
                }
                
                News.Publicado = datosNuevos.Published;
            }
            else
            {
                News.ImagenUrl = datosNuevos.ImageUrl;
            }
                await _appDbContext.SaveChangesAsync();
        }

        public async Task UpdateVisibleNews(int NewsId)
        {
            var News = await _appDbContext.Noticia
                       .Where(n => n.IdNoticia == NewsId)
                       .FirstOrDefaultAsync();

            if (News == null)
                throw new KeyNotFoundException("La noticia no fue encontrada.");

            if (News.Publicado == true)
            {
                News.Publicado = false;
            } else
            {
                News.Publicado = true;
            }

            await _appDbContext.SaveChangesAsync();
        }

        public async Task DeleteNoticia(int NewsId)
        {
            var News = await _appDbContext.Noticia
                       .Where(n => n.IdNoticia == NewsId)
                       .FirstOrDefaultAsync();

            if (News == null)
                throw new KeyNotFoundException("La noticia no fue encontrada.");

            News.Estado = false;

            await _appDbContext.SaveChangesAsync();
        }

        public async Task<List<AdditionalFeaturesDTO.GetNewsDTO>> GetNoticas()
        {
            var listado = await _appDbContext.Noticia
                          .Where(n => n.Estado == true)
                          .Select(n => new AdditionalFeaturesDTO.GetNewsDTO
                          {
                              NewsId = n.IdNoticia,
                              Title = n.Titulo,
                              Content = n.Contenido,
                              ImageUrl = n.ImagenUrl,
                              Published = n.Publicado,
                              CreationDate = n.FechaCreacion,
                              CreateByUserID = n.UsuarioId,
                              NameUsuario = n.Usuario.Nombre + " " + n.Usuario.Apellido

                          }).ToListAsync();
            return listado;
        }
    }
}
