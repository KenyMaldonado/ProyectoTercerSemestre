namespace Proyecto.Server.Models
{
    public class Usuario
    {

        public class objUsarioParameter
        {
            public int idUsario { get; set; }
        }

        public class listaUsarios
        {
            public List<UsarioUnitario>? objListaUsuario { get; set; }
        }

        public class UsarioUnitario
        {
            public int UsuarioId { get; set; }
            public string Nombre { get; set; } = null!;
            public string Apellido { get; set; } = null!;
            public string Contrasenia { get; set; } = null!;
            public string TipoRol { get; set; } = null!;
            public string Estado { get; set; } = null!;
            public string CorreoElectronico { get; set; } = null!;
            public DateTime FechaCreacion { get; set; }
        }
        
    }
}
