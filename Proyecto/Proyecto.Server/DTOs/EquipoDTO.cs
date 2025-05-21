using System.Text.Json.Serialization;

namespace Proyecto.Server.DTOs
{
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

            public int SubTorneoId { get; set; }

            public int GrupoId { get; set; }

            public int FacultadId { get; set; }
            public string NameFacultad { get; set; }

            public string ImagenEquipo {  get; set; }

            public string NameSubTournament { get; set; }

            public string NameTournament { get; set; }

            [JsonConverter(typeof(JsonStringEnumConverter))]
            public EstadoEquipo Estado { get; set; }
            

            public class UpdateTeamDTO
            {
                public int EquipoId { get; set; }

                public string Nombre { get; set; } = null!;

                public string ColorUniforme { get; set; } = null!;

                public string ColorUniformeSecundario { get; set; } = null!;
            }
    }

}
