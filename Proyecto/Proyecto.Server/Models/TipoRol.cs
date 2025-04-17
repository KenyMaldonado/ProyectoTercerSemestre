namespace Proyecto.Server.Models
{
    public class TipoRol
    {
        public int RolId { get; set; }

        public string Nombre { get; set; } = null!;

        public string Descripcion { get; set; } = null!;

        public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }
}
