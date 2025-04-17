namespace Proyecto.Server.Models
{
    public class Facultad
    {
        public int FacultadId { get; set; }
        public string Nombre { get; set; } = null!;
        public bool Estado { get; set; }
        public virtual ICollection<CarreraSemestre> CarreraSemestres { get; set; } = new List<CarreraSemestre>();
        public virtual ICollection<Equipo> Equipos { get; set; } = new List<Equipo>();
    }
}
