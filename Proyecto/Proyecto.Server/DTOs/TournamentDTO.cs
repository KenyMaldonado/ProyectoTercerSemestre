using Proyecto.Server.Models;

namespace Proyecto.Server.DTOs
{
    public class TournamentDTO
    {
        public int TorneoId { get; set; }
        public string Nombre { get; set; } = null!;
        public DateOnly FechaInicio { get; set; }
        public DateOnly FechaFin { get; set; }
        public string Descripcion { get; set; } = null!;
        public string BasesTorneo { get; set; } = null!;
        public DateOnly FechaInicioInscripcion { get; set; }
        public DateOnly FechaFinInscripcion { get; set; }
        public int CantidadParticipantes { get; set; }
        public int UsuarioId { get; set; }
        public int? EquipoMin { get; set; }
        public int? EquipoMax { get; set; }
        public List<SubTorneo> Ramas { get; set; }
    }
}
