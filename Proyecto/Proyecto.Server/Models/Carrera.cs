namespace Proyecto.Server.Models
{
    public class Carrera
    {
        public int CarreraId { get; set; }

        public string Nombre { get; set; } = null!;

        public bool? Estado { get; set; }

        public int FacultadId { get; set; }

        public virtual ICollection<CarreraSemestre> CarreraSemestres { get; set; } = new List<CarreraSemestre>();

        public virtual Facultad Facultad { get; set; } = null!;
    }
}
