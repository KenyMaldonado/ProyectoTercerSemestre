using Proyecto.Server.Models;

namespace Proyecto.Server.DTOs
{
    public class TournamentDTO
    {
        public CreateTournamenteParameter Datos { get; set; }
        public int UsuarioId { get; set; }
        public int? EquipoMin { get; set; }
        public int? EquipoMax { get; set; }
        public List<SubTorneo> Ramas { get; set; }
        


        public class TypeOfTournament
        {
            public int TipoTorneoId { get; set; }
            public string NombreTipoTorneo { get; set; }
            public string DescripcionTipoTorneo { get; set; }
        }

        public class CreateTournamenteParameter
        {
            public string Nombre { get; set; } = null!;
            public DateOnly FechaInicio { get; set; }
            public DateOnly FechaFin { get; set; }
            public string Descripcion { get; set; } = null!;
            public string BasesTorneo { get; set; } = null!;
            public DateOnly FechaInicioInscripcion { get; set; }
            public DateOnly FechaFinInscripcion { get; set; }
            public int CantidadParticipantes { get; set; }
            public int TipoTorneoID {  get; set; }
            public string Ramas {  get; set; }
        }

        public class GetTournamentDTO
        {
            public string Nombre { get; set; } = null!;
            public string Rama { get; set; }
            public DateOnly FechaInicio { get; set; }
            public DateOnly FechaFin { get; set; }
            public string Descripcion { get; set; } = null!;
            public string BasesTorneo { get; set; } = null!;
            public DateOnly FechaInicioInscripcion { get; set; }
            public DateOnly FechaFinInscripcion { get; set; }
            public int CantidadParticipantes { get; set; }
            public string TipoTorneo { get; set; }
            public string CreatedBy { get; set; }
            
        }

    }
}
