namespace Proyecto.Server.Models
{
    public class PreInscripcion
    {
        public int PreInscripcionId { get; set; }

        public string? Codigo { get; set; }

        public string Email { get; set; }

        public string? DataSave { get; set; }

        public virtual ICollection<Inscripcion> Inscripcions { get; set; } = new List<Inscripcion>();
    }
}
