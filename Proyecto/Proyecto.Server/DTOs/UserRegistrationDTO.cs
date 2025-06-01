using Microsoft.OpenApi.Interfaces;
using System.Security.Cryptography.X509Certificates;

namespace Proyecto.Server.DTOs
{
    public class UserRegistrationDTO
    {
        public UserRegistrationParameter Datos {  get; set; }
        public int UsuarioCreo { get; set; } 

        public class AuthRequestDTO
        {
            public string Correo { set; get; }
            public string Contrasenia {  set; get; }
        }

        public class UserRegistrationParameter 
        {
            public string Nombre { get; set; }
            public string Apellido { get; set; }
            public string Contrasenia { get; set; }
            public int RolId { get; set; }
            public string CorreoElectronico { get; set; }
            public string TokenActivacion { get; set; }
            public DateTime TokenExpiracion { get; set; }
        }
        
        public class UserGetCredenciales
        {
            public string Nombre { get; set; }
            public string Apellido { get; set; }
            public int UsuarioId {  get; set; }
            public string Contrasenia { get; set; }
            public string Correo { set; get; }

        }
    }
    
}
