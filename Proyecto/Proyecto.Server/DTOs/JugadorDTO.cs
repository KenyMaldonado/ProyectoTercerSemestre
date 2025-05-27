namespace Proyecto.Server.DTOs
{
    public class JugadorDTO
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

        public int MunicipioId { get; set; }

        public string MunicipioName { get; set; }

        public int? DepartamentoId { get; set; }

        public string? DepartamentoName { get; set; }
        public int? CarreraId { get; set; }
        public string CarreraName { get; set; }
        public int CarreraSemestreId { get; set; }

        public int Semestre { get; set; }

        public string Seccion { get; set; }

        public string CodigoCarrera { get; set; }

        public DateOnly FechaNacimiento { get; set; }

        public int Edad { get; set; }

        public string? Telefono { get; set; }

        public EstadoJugador Estado {  get; set; }
        public string? EstadoTexto { get; set; }

        public JugadorEquipoDTO asignacion {  get; set; }

        public class VerifyPlayers()
        {
            public JugadorDTO datosJugador { get; set; }

            public bool aprobado {  get; set; }
        }

        public class JugadorEquipoDTO
        {
            public int PosicionId { get; set; }
            public string PosicionName {get; set;}
            public int Dorsal { get; set; }
            public int EquipoId { get; set; }
            public int JugadorId { get; set; }
            public bool Estado {  get; set; }
            public int FacultadID { get; set; }

        }

        public class PosicionJugadorDTO
        {
            public int PosicionId { get; set; }
            public string NombrePosicion { get; set; }
            public string Abreviatura { get; set; }
        }

        public class UpdateJugadorDTO
        {
            public string Nombre { get; set; } = null!;

            public string Apellido { get; set; } = null!;

            public int Carne { get; set; }

            public int MunicipioId { get; set; }

            public int CarreraSemestreId { get; set; }

            public DateOnly FechaNacimiento { get; set; }

            public int Edad { get; set; }

            public string? Telefono { get; set; }

        }
    }

}
