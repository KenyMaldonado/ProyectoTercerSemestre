namespace Proyecto.Server.Models
{
    public class Facultad
    {
        public int FacultadId { get; set; }

        public string Nombre { get; set; } = null!;

        public bool Estado { get; set; }

        public virtual ICollection<Carrera> Carreras { get; set; } = new List<Carrera>();

        public virtual ICollection<Equipo> Equipos { get; set; } = new List<Equipo>();
    }
}
