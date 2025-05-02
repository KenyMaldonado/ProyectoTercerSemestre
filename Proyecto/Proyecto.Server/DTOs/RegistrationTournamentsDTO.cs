using System.Text.Json.Serialization;

namespace Proyecto.Server.DTOs
{
    public class RegistrationTournamentsDTO
    {
        public class MunicipiosDTO
        {
            public int MunicipioId { get; set; }

            public string Nombre { get; set; } = null!;

            public int? DepartamentoId { get; set; }
        }

        public class DepartametosDTO
        {
            public int DepartamentoId { get; set; }

            public string Nombre { get; set; } = null!;
        }

        public class FacultadDTO
        {
            public int FacultadId { get; set; }
            public string Nombre { get; set; } = null!;
        }

        public class carreraDTO
        {
            public int CarreraId { get; set; }

            public string Nombre { get; set; } = null!;

            public bool? Estado { get; set; }

            public int FacultadId { get; set; }
        }

        public class CarreraSemestreDTO
        {
            public int CarreraId { get; set; }

            public string CodigoCarrera { get; set; } = null!;

            public int? CarreraId1 { get; set; }
        }

        public class CapitanDTO
        {
            public JugadorDTO jugadorCapitan { get; set; }

            public string Telefono { get; set; } = null!;

            public string CorreoElectronico { get; set; } = null!;

            public int JugadorId { get; set; }
        }

        public class JugadorDTO
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
        }

        public class EquipoDTO
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

            public int TorneoId { get; set; }

            [JsonConverter(typeof(JsonStringEnumConverter))]
            public EstadoEquipo Estado { get; set; }

            public int GrupoId { get; set; }

            public int FacultadId { get; set; }
        }

        public class NewTeamRegistration()
        {
            public int IdSubtorneo { get; set; }
            public CapitanDTO capitan { get; set; }
            public EquipoDTO NewTeam { get; set; }
            public List<JugadorDTO> ListaJugadores { get; set; }

        }

        public class RegistrationStartDTO()
        {
            public int PreInscripcionId { get; set; }

            public string? Codigo { get; set; }

            public string? Email { get; set; }

            public string? DataSave { get; set; }
        }
    }

}
