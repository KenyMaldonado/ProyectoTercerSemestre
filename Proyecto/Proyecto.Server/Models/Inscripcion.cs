namespace Proyecto.Server.Models
{
    public class Inscripcion
    {
        public enum EstadosInscripcion
        {
            Aprobada = 1,
            EnRevision = 2,
            Rechazada = 3,
            ConCorrecion = 4,
            Cancelada = 5
        }
        public int EquipoId { get; set; }

        public int InscripcionId { get; set; }

        public EstadosInscripcion Estado { get; set; }

        public DateTime FechaInscripcion { get; set; }

        public int SubTorneoId { get; set; }

        public int? PreInscripcionId { get; set; }

        public virtual Equipo Equipo { get; set; } = null!;

        public virtual PreInscripcion? PreInscripcion { get; set; }

        public virtual SubTorneo SubTorneo { get; set; } = null!;
    }
}
