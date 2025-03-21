namespace Proyecto.Server.Models
{
    public class Partido
    {
        public int PartidoId { get; set; }
        public DateTime FechaPartido { get; set; }
        public TimeOnly HoraPartido { get; set; }
        public string Cancha { get; set; } = null!;
        public int? Equipo1 { get; set; }
        public int? Equipo2 { get; set; }
        public string Estado { get; set; } = null!;
        public int? JornadaId { get; set; }
        public int? FaseId { get; set; }
    }
}
