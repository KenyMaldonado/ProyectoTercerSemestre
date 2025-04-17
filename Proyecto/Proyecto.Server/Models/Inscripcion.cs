namespace Proyecto.Server.Models
{
    public class Inscripcion
    {
        public int InscripcionId { get; set; }
        public int EquipoId { get; set; }
        public string Estado { get; set; } = null!;
        public DateTime FechaInscripcion { get; set; }
        public int SubTorneoId { get; set; }
        public virtual Equipo Equipo { get; set; } = null!;
        public virtual SubTorneo SubTorneo { get; set; } = null!;
    }
}
