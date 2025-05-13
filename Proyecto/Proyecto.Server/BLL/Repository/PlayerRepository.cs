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
                    FechaNacimiento = j.FechaNacimiento,
                    Edad = j.Edad,
                    Telefono = j.Telefono,
                    EstadoTexto = Enum.GetName(typeof(JugadorDTO.EstadoJugador), j.Estado),
                    Estado = (JugadorDTO.EstadoJugador)j.Estado // Convertimos el valor numérico al enum
                })
                .ToList();

            // Construir la lista con resultados combinados
            var resultado = carnets.Select(c =>
            {
                var jugador = jugadoresExistentes.FirstOrDefault(j => j.Carne == c);

                // Si el jugador no existe
                if (jugador == null)
                {
                    return new JugadorDTO.VerifyPlayers
                    {
                        datosJugador = new JugadorDTO(), // Objeto vacío
                        aprobado = true
                    };
                }

                // Si el jugador existe pero no está en estado "Libre"
                if (jugador.Estado != JugadorDTO.EstadoJugador.Libre)
                {
                    return new JugadorDTO.VerifyPlayers
                    {
                        datosJugador = null, // No se devuelven datos
                        aprobado = false
                    };
                }

                // Si el jugador existe y está en estado "Libre"
                return new JugadorDTO.VerifyPlayers
                {
                    datosJugador = jugador,
                    aprobado = true
                };
            }).ToList();

            return resultado;
        }

    }
}
