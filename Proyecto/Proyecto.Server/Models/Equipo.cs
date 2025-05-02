using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Proyecto.Server.Models
{
    public class Equipo
    {
        public enum EstadoEquipo
        {
            Activo = 1,
            Descalificado = 2,
            Suspendido = 3,
            Retirado = 4,
            Inactivo = 5
        }
        public int EquipoId { get; set; }

        public string Nombre { get; set; } = null!;

        public string ColorUniforme { get; set; } = null!;

        public string ColorUniformeSecundario { get; set; } = null!;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EstadoEquipo Estado { get; set; }

        public int GrupoId { get; set; }

        public int FacultadId { get; set; }

        public int? SubTorneoId { get; set; }

        public virtual ICollection<Cambio> Cambios { get; set; } = new List<Cambio>();

        public virtual Facultad Facultad { get; set; } = null!;

        public virtual Grupos Grupo { get; set; } = null!;

        public virtual ICollection<Inscripcion> Inscripcions { get; set; } = new List<Inscripcion>();

        public virtual ICollection<Jugador> Jugadors { get; set; } = new List<Jugador>();

        public virtual ICollection<Partido> PartidoEquipo1Navigations { get; set; } = new List<Partido>();

        public virtual ICollection<Partido> PartidoEquipo2Navigations { get; set; } = new List<Partido>();

        public virtual SubTorneo? SubTorneo { get; set; }
    }
}
