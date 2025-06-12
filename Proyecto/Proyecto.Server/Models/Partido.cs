namespace Proyecto.Server.Models
{
    public class Partido
    {
        public int PartidoId { get; set; }

        public DateTime FechaPartido { get; set; }

        public TimeOnly HoraPartido { get; set; }

        public int? Equipo1 { get; set; }

        public int? Equipo2 { get; set; }

        public string Estado { get; set; } = null!;

        public int? JornadaId { get; set; }

        public int? FaseId { get; set; }

        public int? UsuarioId { get; set; }

        public int CanchaId { get; set; }

        public virtual ICollection<Cambio> Cambios { get; set; } = new List<Cambio>();

        public virtual Cancha Cancha { get; set; } = null!;

        public virtual Equipo? Equipo1Navigation { get; set; }

        public virtual Equipo? Equipo2Navigation { get; set; }

        public virtual FaseEliminacion? Fase { get; set; }

        public virtual Jornada? Jornada { get; set; }

        public virtual ICollection<ResultadoPartido> ResultadoPartidos { get; set; } = new List<ResultadoPartido>();

        public virtual Usuario Usuario { get; set; } = null!;
    }

}
