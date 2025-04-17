namespace Proyecto.Server.Models
{
    public class SubTorneo
    {
        public int SubTorneoId { get; set; }
        public string Categoria { get; set; } = null!;
        public int TorneoId { get; set; }
        public virtual ICollection<Inscripcion> Inscripcions { get; set; } = new List<Inscripcion>();
        public virtual Torneo Torneo { get; set; } = null!;
    }
}
