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
            Inactivo = 5
        }
        public string Nombre { get; set; } = null!;

        public string Apellido { get; set; } = null!;

        public int JugadorId { get; set; }

        public int Carne { get; set; }

        public int EquipoId { get; set; }

        public string? Fotografia { get; set; }

        public int PosicionId { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EstadoJugador Estado { get; set; }

        public int Dorsal { get; set; }

        public int? MunicipioId { get; set; }

        public int? CarreraSemestreId { get; set; }

        public virtual ICollection<Cambio> Cambios { get; set; } = new List<Cambio>();

        public virtual ICollection<Capitan> Capitans { get; set; } = new List<Capitan>();

        public virtual CarreraSemestre? CarreraSemestre { get; set; }

        public virtual Equipo Equipo { get; set; } = null!;

        public virtual ICollection<Goles> Goles { get; set; } = new List<Goles>();

        public virtual Municipio? Municipio { get; set; }

        public virtual PosicionJugador Posicion { get; set; } = null!;

        public virtual ICollection<Tarjeta> Tarjeta { get; set; } = new List<Tarjeta>();
    }
}

