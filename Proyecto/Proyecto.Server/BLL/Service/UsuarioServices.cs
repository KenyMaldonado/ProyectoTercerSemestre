
using Proyecto.Server.Models;
using System;
using System.Security.AccessControl;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using System.Diagnostics;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc.Diagnostics;


namespace Proyecto.Server.BLL.Service

{
    public class UsuarioServices
    {
        private readonly StoreProcedure _storeProcedure;


        public UsuarioServices(StoreProcedure storeProcedure)
        {
            _storeProcedure = storeProcedure;
        }

        public void RegistrarUsuario(RegistroDTO usuario)
        {
            string hash = BCrypt.Net.BCrypt.HashPassword(usuario.Contrasenia);

            var Usuario = new RegistroDTO();

            Usuario.Nombre = usuario.Nombre;
            Usuario.Apellido = usuario.Apellido;
            Usuario.Contrasenia = hash;
            Usuario.TipoRol = usuario.TipoRol;
            Usuario.CorreoElectronico = usuario.CorreoElectronico;

            var ParametrosUsuario = new Dictionary<string, object>()
            {
                {"@nombre", Usuario.Nombre},
                {"@apellido", Usuario.Apellido},
                {"@password", Usuario.Contrasenia },
                {"@rol", Usuario.TipoRol },
                {"@correo", Usuario.CorreoElectronico },
            };

            _storeProcedure.EjecutarProcedimientoAlmacenado("sp_createUser", System.Data.CommandType.StoredProcedure, ParametrosUsuario, null);
        }

        public static bool IncioUsuario(string PasswordHash, string Password)
        {
            bool PasswordValida = BCrypt.Net.BCrypt.Verify(Password, PasswordHash);
            Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("patito789@"));

            return PasswordValida;
        }
    }
}
