namespace Proyecto.Server.Models
{
    public class ResultadoPartido
    {
        public int ResultadoPartidoId { get; set; }

        public int PartidoId { get; set; }

        public int GolesEquipo1 { get; set; }

        public int GolesEquipo2 { get; set; }

        public virtual ICollection<Goles> Goles { get; set; } = new List<Goles>();

        public virtual Partido Partido { get; set; } = null!;

        public virtual ICollection<Tarjeta> Tarjeta { get; set; } = new List<Tarjeta>();
    }
}
