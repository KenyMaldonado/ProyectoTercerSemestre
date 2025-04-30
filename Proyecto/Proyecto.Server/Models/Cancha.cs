namespace Proyecto.Server.Models
{
    public class Cancha
    {
        public int CanchaId { get; set; }
        public string Nombre { get; set; } = null!;
        public int Capacidad { get; set; }
        public string Estado { get; set; } = null!;
        public virtual ICollection<Partido> Partidos { get; set; } = new List<Partido>();
    }
}
