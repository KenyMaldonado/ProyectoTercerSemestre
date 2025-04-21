namespace Proyecto.Server.Models
{
    public class Torneo
    {
        public int TorneoId { get; set; }
        public string Nombre { get; set; } = null!;
        public DateOnly FechaInicio { get; set; }
        public DateOnly FechaFin { get; set; }
        public string Descripcion { get; set; } = null!;
        public string BasesTorneo { get; set; } = null!;
        public DateOnly FechaInicioInscripcion { get; set; }
        public DateOnly FechaFinInscripcion { get; set; }
        public int CantidadParticipantes { get; set; }
        public int UsuarioId { get; set; }
        public int TipoTorneoId { get; set; }
        public virtual ICollection<Equipo> Equipos { get; set; } = new List<Equipo>();
        public virtual ICollection<SubTorneo> SubTorneos { get; set; } = new List<SubTorneo>();
        public virtual TipoTorneo TipoTorneo { get; set; } = null!;
        public virtual Usuario Usuario { get; set; } = null!;
    }
}
