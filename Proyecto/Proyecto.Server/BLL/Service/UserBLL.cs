using Microsoft.Extensions.Configuration;
using Proyecto.Server.BLL.Interface;
using Proyecto.Server.BLL.Repository;
using Proyecto.Server.DTOs;
using Proyecto.Server.Utils;
using System.Data;

namespace Proyecto.Server.BLL.Service
{
    public class UserBLL : IUserBLL
    {
        private readonly IUserRepository _usuarioRepositorio;
        private readonly IConfiguration _configuration;
        private readonly UserHelps _userHelps = new UserHelps();
        public UserBLL(IUserRepository usuarioRepositorio, IConfiguration configuration)
        {
            _usuarioRepositorio = usuarioRepositorio;
            _configuration = configuration;
        }

        public string AuthenticateUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion)
        {
            DataTable dt = _usuarioRepositorio.GetCredentials(parametrosPeticion.Correo.ToLower());

            if (dt.Rows.Count == 0)
                return null; // Usuario no encontrado

            var listaDatos = dt.AsEnumerable().Select(row => new UserRegistrationDTO.AuthRequestDTO
            {
                Correo = row.Field<string>(0),
                Contrasenia = row.Field<string>(1),
                UsuarioID = row.Field<int>(2)

            }).ToList();

            bool esValido = _userHelps.VeryfyPassword(listaDatos[0].Contrasenia, parametrosPeticion.Contrasenia);
            if (!esValido)
            {
                return null; // las credenciales no coinciden
            } else
            {
                string rol = _usuarioRepositorio.GetRolByEmail(parametrosPeticion.Correo.ToLower());
                if (string.IsNullOrEmpty(rol))
                {
                    return ("Rol no encontrado para el usuario.");
                }

                TokenServices tokenService = new TokenServices(_configuration);
                return tokenService.GenerateToken(parametrosPeticion.Correo.ToLower(), rol, listaDatos[0].UsuarioID.ToString());
            }


        }

        public void CreateUser (UserRegistrationDTO userRegistrationDTO)
        {
            string PasswordHash = _userHelps.CreateHash(userRegistrationDTO.Contrasenia);
            userRegistrationDTO.Contrasenia = PasswordHash;
            _usuarioRepositorio.CreateNewUser(userRegistrationDTO);
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            return await _usuarioRepositorio.EmailExistsAsync(email);
        }

        public async Task<string> GetRolByEmail(string email)
        {
            return _usuarioRepositorio.GetRolByEmail(email);
        }
    }
}
