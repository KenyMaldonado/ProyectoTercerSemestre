namespace Proyecto.Server.Models
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string Contrasenia { get; set; } = null!;
        public string TipoRol { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public string CorreoElectronico { get; set; } = null!;
    }
}
