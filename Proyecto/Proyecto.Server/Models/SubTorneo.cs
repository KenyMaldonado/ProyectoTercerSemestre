using System.Text.Json.Serialization;

namespace Proyecto.Server.Models
{
    public class SubTorneo
    {
        public enum EstadoSubTorneo
        {
            Activo = 1,
            Finalizado = 2,
            Suspendido = 3,
            EnCurso = 4,
            Cancelado = 5,
            Eliminado = 6
        }

        public int SubTorneoId { get; set; }

        public string Categoria { get; set; } = null!;

        public int TorneoId { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EstadoSubTorneo Estado { get; set; }

        public int? CantidadEquipos { get; set; }

        public virtual ICollection<Equipo> Equipos { get; set; } = new List<Equipo>();

        public virtual ICollection<Inscripcion> Inscripcions { get; set; } = new List<Inscripcion>();

        public virtual Torneo Torneo { get; set; } = null!;
    }
}
