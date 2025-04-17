namespace Proyecto.Server.Models
{
    public class PosicionJugador
    {
        public int PosicionId { get; set; }
        public string Nombre { get; set; } = null!;
        public virtual ICollection<Jugador> Jugadors { get; set; } = new List<Jugador>();
    }
}
