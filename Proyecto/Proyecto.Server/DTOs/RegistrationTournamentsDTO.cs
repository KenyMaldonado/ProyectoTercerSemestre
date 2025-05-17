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

            public string CorreoElectronico { get; set; } = null!;

            public int JugadorId { get; set; }
        }

        public class NewTeamRegistration()
        {
            public int IdSubtorneo { get; set; }
            public int? PreInscripcionId { get; set; }
            public CapitanDTO capitan { get; set; }
            public EquipoDTO NewTeam { get; set; }
            public List<JugadorDTO> ListaJugadores { get; set; }

        }

        public class RegistrationStartDTO()
        {
            public int PreInscripcionId { get; set; }

            public bool IsNew { get; set; }

            public string? Codigo { get; set; }

            public string? Email { get; set; }

            public string? DataSave { get; set; }
        }
    }

}
