using System.Text.Json.Serialization;

namespace Proyecto.Server.Models
{
    public class Jugador
    {
        public enum EstadoJugador
        {
            Activo = 1,
            Lesionado = 2,
            Suspendido = 3,
            Expulsado = 4,
            Inactivo = 5,
            Libre = 6
        }
        public string Nombre { get; set; } = null!;

        public string Apellido { get; set; } = null!;

        public int JugadorId { get; set; }

        public int Carne { get; set; }

        public string? Fotografia { get; set; }

        public EstadoJugador Estado { get; set; }

        public int MunicipioId { get; set; }

        public int CarreraSemestreId { get; set; }

        public DateOnly FechaNacimiento { get; set; }

        public int Edad { get; set; }

        public string? Telefono { get; set; }

        public virtual ICollection<Cambio> Cambios { get; set; } = new List<Cambio>();

        public virtual ICollection<Capitan> Capitans { get; set; } = new List<Capitan>();

        public virtual CarreraSemestre CarreraSemestre { get; set; } = null!;

        public virtual ICollection<Goles> Goles { get; set; } = new List<Goles>();

        public virtual ICollection<JugadorEquipo> JugadorEquipos { get; set; } = new List<JugadorEquipo>();

        public virtual Municipio Municipio { get; set; } = null!;

        public virtual ICollection<Tarjeta> Tarjeta { get; set; } = new List<Tarjeta>();
    }
}

