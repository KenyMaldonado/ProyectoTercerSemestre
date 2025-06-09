using Proyecto.Server.Models;

namespace Proyecto.Server.DTOs
{
    public class MatchesDTO
    {
        public class CanchaDTO
        {
            public int CanchaId { get; set; }
            public string Nombre { get; set; } = null!;
            public int Capacidad { get; set; }
            public string Estado { get; set; } = null!;
        }

        public class PartidoDTO
        {
            public int PartidoId { get; set; }

            public DateTime FechaPartido { get; set; }

            public TimeOnly HoraPartido { get; set; }

            public int? Equipo1 { get; set; }

            public int? Equipo2 { get; set; }

            public string Estado { get; set; } = null!;

            public int? JornadaId { get; set; }

            public int? FaseId { get; set; }

            public int UsuarioId { get; set; }

            public int CanchaId { get; set; }

        }

        
    }
}
