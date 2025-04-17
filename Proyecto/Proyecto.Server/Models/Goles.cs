namespace Proyecto.Server.Models
{
    public class Goles
    {
        public int GolId { get; set; }

        public int? MinutoGol { get; set; }

        public bool EsTiempoExtra { get; set; }

        public int? OrdenPenal { get; set; }

        public int ResultadoPartidoId { get; set; }

        public int JugadorId { get; set; }

        public int TipoGolId { get; set; }

        public virtual Jugador Jugador { get; set; } = null!;

        public virtual ResultadoPartido ResultadoPartido { get; set; } = null!;

        public virtual TipoGol TipoGol { get; set; } = null!;
    }
}
