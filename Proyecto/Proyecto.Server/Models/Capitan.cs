namespace Proyecto.Server.Models
{
    public class Capitan
    {
        public int CapitanId { get; set; }

        public string Telefono { get; set; } = null!;

        public string CorreoElectronico { get; set; } = null!;

        public int JugadorId { get; set; }

        public virtual Jugador Jugador { get; set; } = null!;
    }
}
