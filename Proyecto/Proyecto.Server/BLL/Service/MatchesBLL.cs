using Org.BouncyCastle.Crypto.Operators;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Service
{
    public class MatchesBLL : IMatchesBLL
    {
        private readonly IMatchesRepository _matchaesRepository;
        private readonly IConfiguration _configuration;

        public MatchesBLL(IMatchesRepository matchesRepository, IConfiguration configuration)
        {
            _matchaesRepository = matchesRepository;
            _configuration = configuration;
        }

        public async Task<List<MatchesDTO.CanchaDTO>> GetCanchas()
        {
            return await _matchaesRepository.GetCanchas();
        }

        public async Task UpdateCancha(MatchesDTO.CanchaDTO datos)
        {
            await _matchaesRepository.UpdateCancha(datos);
        }

        public async Task DeleteCancha(int CanchaID)
        {
            await _matchaesRepository.DeleteCancha(CanchaID);
        }

        public async Task CreateCancha(MatchesDTO.CanchaDTO datosNuevos)
        {
            await _matchaesRepository.CreateCancha(datosNuevos);
        }


    }
}
