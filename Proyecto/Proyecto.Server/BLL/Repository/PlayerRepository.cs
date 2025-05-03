using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Repository
{
    public class PlayerRepository : IPlayerRepository
    {
        private readonly AppDbContext _appDbContext;

        public PlayerRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public List<JugadorDTO.VerifyPlayers> VerifyPlayers(List<int> carnets)
        {
            // Obtener jugadores existentes con esos carnés
            var jugadoresExistentes = _appDbContext.Jugadors
                .Where(j => carnets.Contains(j.Carne))
                .AsEnumerable()
                .Select(j => new JugadorDTO
                {
                    Nombre = j.Nombre,
                    Apellido = j.Apellido,
                    JugadorId = j.JugadorId,
                    Carne = j.Carne,
                    Fotografia = j.Fotografia,
                    MunicipioId = j.MunicipioId,
                    CarreraSemestreId = j.CarreraSemestreId,
                    FechaNacimiento = (j.FechaNacimiento),
                    Edad = j.Edad,
                    Telefono = j.Telefono,
                    EstadoTexto = Enum.GetName(typeof(JugadorDTO.EstadoJugador), j.Estado)
                })
                .ToList();

            // Construir la lista con resultados combinados
            var resultado = carnets.Select(c =>
            {
                var jugador = jugadoresExistentes.FirstOrDefault(j => j.Carne == c);
                return new JugadorDTO.VerifyPlayers
                {
                    datosJugador = jugador,
                    existe = jugador != null
                };
            }).ToList();

            return resultado;
        }

    }
}
