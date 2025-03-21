namespace Proyecto.Server.Models
{
    public class CarreraSemestre
    {
        public int CarreraId { get; set; }
        public string Nombre { get; set; } = null!;

        public int Semestre { get; set; }

        public string CodigoCarrera { get; set; } = null!;

        public string Seccion { get; set; } = null!;

        public int FacultadId { get; set; }
    }
}
