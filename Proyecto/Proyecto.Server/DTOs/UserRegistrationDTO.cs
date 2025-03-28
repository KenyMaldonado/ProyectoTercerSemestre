using Microsoft.OpenApi.Interfaces;
using System.Security.Cryptography.X509Certificates;

namespace Proyecto.Server.DTOs
{
    public class UserRegistrationDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Contrasenia { get; set; }
        public string TipoRol { get; set; }
        public string CorreoElectronico { get; set; }
        public int UsuarioCreo { get; set; } 

        public class AuthRequestDTO()
        {
            public string Correo { set; get; }
            public string Contrasenia {  set; get; }
            public int UsuarioID { get; set; }
        }
    }
    
}
