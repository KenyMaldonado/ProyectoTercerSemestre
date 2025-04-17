namespace Proyecto.Server.Models
{
    public class Jornada
    {
        public int JornadaId { get; set; }
        public int NumeroJornada { get; set; }
        public virtual ICollection<Partido> Partidos { get; set; } = new List<Partido>();
    }
}
