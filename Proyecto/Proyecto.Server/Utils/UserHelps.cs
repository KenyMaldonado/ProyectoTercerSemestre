
using Proyecto.Server.Models;
using System;
using System.Security.AccessControl;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using System.Diagnostics;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc.Diagnostics;


namespace Proyecto.Server.Utils

{
    public class UserHelps
    {
        public UserHelps()
        {
        }


        public string CreateHash(string Password)
        {
            return BCrypt.Net.BCrypt.HashPassword(Password);
        }


        public bool VeryfyPassword(string PasswordHash, string Password)
        {
            bool PasswordValida = BCrypt.Net.BCrypt.Verify(Password, PasswordHash);
            return PasswordValida;
        }
    }
}
