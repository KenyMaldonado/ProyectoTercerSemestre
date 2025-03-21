namespace Proyecto.Server.Models
{
    public class Goles
    {
        public int GolId { get; set; }

        public int? MinutoGol { get; set; }

        public string TipoGol { get; set; } = null!;

        public bool EsTiempoExtra { get; set; }

        public int? OrdenPenal { get; set; }

        public int ResultadoPartidoId { get; set; }

        public int JugadorId { get; set; }
    }
}
