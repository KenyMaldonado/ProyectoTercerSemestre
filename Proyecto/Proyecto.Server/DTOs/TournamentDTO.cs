using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Proyecto.Server.Models;

namespace Proyecto.Server.DTOs
{
    public class TournamentDTO
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

        public enum EstadoSubTorneo
        {
            Activo = 1,
            Finalizado = 2,
            Suspendido = 3,
            EnCurso = 4,
            Cancelado = 5,
            Eliminado = 6
        }

        public CreateTournamenteParameter Datos { get; set; }
        public int UsuarioId { get; set; }

        public class TypeOfTournament
        {
            public int TipoTorneoId { get; set; }
            public string NombreTipoTorneo { get; set; }
            public string DescripcionTipoTorneo { get; set; }
        }

        public class TournamentGameTypes
        {
            public int TipoJuegoId { get; set; }

            public string Nombre { get; set; } = null!;

            public int? CantidadJugadores { get; set; }

            public string? Descripcion { get; set; }
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
            public int UsuarioIDCreo { get; set; }
            public int TipoTorneoID {  get; set; }
            public int TipoJuegoID {  get; set; }
            public List<CreateSubtorneo> Subtorneos { get; set; }
        }

        public class CreateSubtorneo
        {
            public int TorneoID {  get; set; }
            public string categoria { get; set; }
            public int? cantidadEquipos { get; set; }
        }

        public class GetTournamentDTO
        {
            public int TorneoId { get; set; }

            public string Nombre { get; set; } = null!;

            public DateOnly FechaInicio { get; set; }

            public DateOnly FechaFin { get; set; }

            public string Descripcion { get; set; } = null!;

            public string BasesTorneo { get; set; } = null!;

            public DateOnly FechaInicioInscripcion { get; set; }

            public DateOnly FechaFinInscripcion { get; set; }

            public int UsuarioId { get; set; }

            public string NameUsuario { get; set; }

            public int TipoTorneoId { get; set; }

            public string  NameTipoTorneo { get; set; }

            [JsonConverter(typeof(JsonStringEnumConverter))]
            public EstadoTorneo Estado { get; set; }

            public int TipoJuegoId { get; set; }

            public string NameTipoJuego { get; set; }

            public string? NameUserModify { get; set; }

            public int? UserModifyId { get; set; }

            public DateTime? FechaModificacion { get; set; }
        }

        public class UpdateTournamentDTO
        {
            public int TorneoId { get; set; }

            public string Nombre { get; set; } = null!;

            public DateOnly FechaFinInscripcion { get; set; }

            public DateOnly FechaInicio { get; set; }

            public DateOnly FechaFin { get; set; }

            public string Descripcion { get; set; } = null!;

            public DateOnly FechaInicioInscripcion { get; set; }

        }

        public class GetSubTournamentDTO
        {
            public int SubTorneoId { get; set; }

            public string Categoria { get; set; } = null!;

            public int TorneoId { get; set; }

            [JsonConverter(typeof(JsonStringEnumConverter))]
            public EstadoSubTorneo Estado { get; set; }

            public int? CantidadEquipos { get; set; }
        }

        public class ParameterUpdateEstadoInscripcion
        {
            public int inscripcionId {  get; set; }
            public Inscripcion.EstadosInscripcion estadoInscripcion { get; set; }
            public Equipo.EstadoEquipo estadoEquipo {  get; set; }
            public string comentario { get; set; }
            public bool estadoJugadorEquipo {  get; set; }
            public Jugador.EstadoJugador estadoJugador {  get; set; }
        }

        public class UpdateEstadoInscripcionDto
        {
            // Si tu frontend envía 'inscripcionID', debe ser 'inscripcionID' o usar [JsonProperty]
            public int inscripcionID { get; set; }

            [Required] // Puedes mantener esto si quieres que el campo sea obligatorio
            public string estado { get; set; }

            // Puedes hacer el comentario opcional si lo deseas, o requerirlo
            [Required(AllowEmptyStrings = true)] // Permite cadena vacía si solo necesitas que no sea null
            public string comentario { get; set; }
        }

        public class StartTournamentRequest
        {
            public int SubtorneoId { get; set; }
            public List<int> EquiposId { get; set; } = new();
            public List<DiaPartidoDTO> DiasPartidos { get; set; } = new();
            public List<DateOnly> DiasOmitidos { get; set; } = new();
        }

        public class DiaPartidoDTO
        {
            public string Dia { get; set; } = string.Empty;  // ej: "lunes"
            public List<TimeOnly> Horarios { get; set; } = new();
        }


    }
}
