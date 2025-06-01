using System.Text.Json.Serialization;

namespace Proyecto.Server.Models
{
    public class Usuario
    {
        public enum EstadoUsuario
        {
            Activo = 1,
            Inactivo = 2,
            Suspendido = 3,
            Eliminado = 4
        }
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string PasswordUser { get; set; } = null!;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EstadoUsuario Estado { get; set; }
        public string CorreoElectronico { get; set; } = null!;
        public int RolId { get; set; }
        public int UsuarioCreo { get; set; }
        public string? TokenActivacion { get; set; }
        public DateTime? TokenExpiracion { get; set; }
        public virtual ICollection<CodigosVerificacion> Codigosverificacions { get; set; } = new List<CodigosVerificacion>();
        public virtual ICollection<Noticia> Noticia { get; set; } = new List<Noticia>();
        public virtual ICollection<Partido> Partidos { get; set; } = new List<Partido>();
        public virtual TipoRol Rol { get; set; } = null!;
        public virtual ICollection<Torneo> Torneos { get; set; } = new List<Torneo>();

    }
}
