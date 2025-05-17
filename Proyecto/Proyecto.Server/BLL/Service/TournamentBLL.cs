using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Service
{
    public class TournamentBLL : ITournamentBLL
    {
        private readonly ITournamentRepository _torneoRepositorio;
        private readonly IConfiguration _configuration;

        public TournamentBLL(ITournamentRepository torneoRepositorio, IConfiguration configuration)
        {
            _torneoRepositorio = torneoRepositorio;
            _configuration = configuration;
        }


        public Task<List<TournamentDTO.TypeOfTournament>> GetTypeOfTournaments()
        {
            return _torneoRepositorio.GetTypesTournaments();
        }

        public async Task CreateTournament(TournamentDTO.CreateTournamenteParameter parametros, int UsuarioCreo)
        {
            try
            {
                // Asignar el usuario que está creando el torneo
                parametros.UsuarioIDCreo = UsuarioCreo;

                // Llamada al repositorio para crear el torneo
                await _torneoRepositorio.CreateNewTournament(parametros);
            }
            catch (ArgumentNullException ex)
            {
                // Captura un error específico si hay un valor nulo en los parámetros
                throw new Exception("Uno de los parámetros obligatorios está vacío: " + ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                // Captura un error si ocurre una operación no válida (ejemplo: conflicto de datos)
                throw new Exception("Hubo un problema con la operación: " + ex.Message);
            }
            catch (Exception ex)
            {
                // Captura cualquier otro tipo de error general
                throw new Exception("Error al crear el torneo: " + ex.Message);
            }
        }


        public Task<List<TournamentDTO.GetTournamentDTO>> GetTournaments()
        {
            return _torneoRepositorio.GetTournaments();
        }

        public Task<List<TournamentDTO.GetSubTournamentDTO>> GetSubTournaments(int TournamentID)
        {
            return _torneoRepositorio.GetSubTournaments(TournamentID);
        }

        public Task<List<TournamentDTO.TournamentGameTypes>> GetTiposJuego()
        {
            return _torneoRepositorio.GetTournamentGameTypes();
        }

        public Task <int> GetLastIDTournament()
        {
            return _torneoRepositorio.GetLastIDTournaments();
        }

        public void ActualizarLinkBasesTorneo(string link, int torneoId)
        {
            _torneoRepositorio.UpdateLinkBasesTorneo(torneoId, link);   
        }

        public async Task UpdateTournament(TournamentDTO.UpdateTournamentDTO datosNuevos, int UsuarioModificoId)
        {
            await _torneoRepositorio.UpdateTournament(datosNuevos, UsuarioModificoId);
        } 
    }
}
