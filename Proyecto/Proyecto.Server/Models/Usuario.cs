namespace Proyecto.Server.Models
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string PasswordUser { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public string CorreoElectronico { get; set; } = null!;
        public int RolId { get; set; }
        public string UsuarioCreo { get; set; } = null!;
        public virtual ICollection<Partido> Partidos { get; set; } = new List<Partido>();
        public virtual TipoRol Rol { get; set; } = null!;
        public virtual ICollection<Torneo> Torneos { get; set; } = new List<Torneo>();

    }
}
