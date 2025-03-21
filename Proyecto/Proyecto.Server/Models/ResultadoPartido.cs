namespace Proyecto.Server.Models
{
    public class ResultadoPartido
    {
        public int ResultadoPartidoId { get; set; }

        public int PartidoId { get; set; }

        public int GolesEquipo1 { get; set; }

        public int GolesEquipo2 { get; set; }
    }
}
