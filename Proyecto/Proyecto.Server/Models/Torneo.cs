using System.Text.Json.Serialization;

namespace Proyecto.Server.Models
{
    public class Torneo
    {
        public enum EstadoTorneo
        {
            Activo = 1,
            Finalizado = 2,
            Suspendido = 3,
            EnCurso = 4,
            Cancelado = 5,
            Eliminado = 6
        }

        public int TorneoId { get; set; }

        public string Nombre { get; set; } = null!;

        public DateOnly FechaInicio { get; set; }

        public DateOnly FechaFin { get; set; }

        public string Descripcion { get; set; } = null!;

        public string BasesTorneo { get; set; } = null!;

        public DateOnly FechaInicioInscripcion { get; set; }

        public DateOnly FechaFinInscripcion { get; set; }

        public int UsuarioId { get; set; }

        public int TipoTorneoId { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EstadoTorneo Estado { get; set; }

        public int TipoJuegoId { get; set; }

        public int? UsuarioModifico { get; set; }

        public DateTime? FechaModificacion { get; set; }

        public virtual ICollection<SubTorneo> SubTorneos { get; set; } = new List<SubTorneo>();

        public virtual TipoJuegoTorneo TipoJuego { get; set; } = null!;

        public virtual TipoTorneo TipoTorneo { get; set; } = null!;

        public virtual Usuario Usuario { get; set; } = null!;
    }
}
