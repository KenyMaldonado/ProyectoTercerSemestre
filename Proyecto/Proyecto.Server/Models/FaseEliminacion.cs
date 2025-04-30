namespace Proyecto.Server.Models
{
    public class FaseEliminacion
    {
        public int FaseId { get; set; }

        public string Nombre { get; set; } = null!;

        public virtual ICollection<Partido> Partidos { get; set; } = new List<Partido>();
    }
}
