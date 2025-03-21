namespace Proyecto.Server.Models
{
    public class Equipo
    {
        public int EquipoId { get; set; }
        public string Nombre { get; set; } = null!;
        public string ColorUniforme { get; set; } = null!;
        public string ColorUniformeSecundario { get; set; } = null!;
        public int TorneoId { get; set; }
        public string Estado { get; set; } = null!;
        public int GrupoId { get; set; }
        public int FacultadId { get; set; }
    }
}
