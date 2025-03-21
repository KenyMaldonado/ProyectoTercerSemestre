namespace Proyecto.Server.Models
{
    public class Tarjeta
    {
        public int TarjetaId { get; set; }

        public int MinutoTarjeta { get; set; }

        public string? Descripcion { get; set; }

        public bool Estado { get; set; }

        public string TipoTarjeta { get; set; } = null!;

        public int ResultadoPartidoId { get; set; }

        public int JugadorId { get; set; }
    }
}
