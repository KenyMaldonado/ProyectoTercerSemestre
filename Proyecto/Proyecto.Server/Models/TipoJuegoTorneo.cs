namespace Proyecto.Server.Models
{
    public class TipoJuegoTorneo
    {
        public int TipoJuegoId { get; set; }

        public string Nombre { get; set; } = null!;

        public int? CantidadJugadores { get; set; }

        public string? Descripcion { get; set; }

        public virtual ICollection<Torneo> Torneos { get; set; } = new List<Torneo>();
    }
}
