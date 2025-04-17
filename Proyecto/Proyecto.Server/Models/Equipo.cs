using System.Text.RegularExpressions;

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
        public virtual ICollection<Cambio> Cambios { get; set; } = new List<Cambio>();
        public virtual Facultad Facultad { get; set; } = null!;
        public virtual Grupos Grupo { get; set; } = null!;
        public virtual ICollection<Inscripcion> Inscripcions { get; set; } = new List<Inscripcion>();
        public virtual ICollection<Jugador> Jugadors { get; set; } = new List<Jugador>();
        public virtual ICollection<Partido> Partidos { get; set; } = new List<Partido>();
        public virtual Torneo Torneo { get; set; } = null!;
    }
}
