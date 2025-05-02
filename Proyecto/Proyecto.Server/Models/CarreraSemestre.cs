namespace Proyecto.Server.Models
{
    public class CarreraSemestre
    {
        // este es la llave primaria de la tabla
        public int CarreraId { get; set; }

        public int Semestre { get; set; }

        public string CodigoCarrera { get; set; } = null!;

        public string Seccion { get; set; } = null!;

        // esta es la llave foranea de la tabla entre carrera y carreraSemestre
        public int? CarreraId1 { get; set; }

        public virtual Carrera? CarreraId1Navigation { get; set; }

        public virtual ICollection<Jugador> Jugadors { get; set; } = new List<Jugador>();
    }
}
