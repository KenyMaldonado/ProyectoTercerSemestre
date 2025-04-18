using Microsoft.Extensions.Configuration;
using Proyecto.Server.BLL.Interface;
using Proyecto.Server.BLL.Repository;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;
using System.Data;

namespace Proyecto.Server.BLL.Service
{
    /// <summary>
    /// 
    /// </summary>
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
            {
                throw new CustomException("Usuario No encontrado", 404);
            }
                
            var listaDatos = dt.AsEnumerable().Select(row => new Usuario
            {
                CorreoElectronico = row.Field<string>(0),
                PasswordUser = row.Field<string>(1),
                UsuarioId = row.Field<int>(2),
                Nombre = row.Field<string>(3),
                Apellido = row.Field<string>(4),
            }).ToList();

            bool esValido = _userHelps.VeryfyPassword(listaDatos[0].PasswordUser, parametrosPeticion.Contrasenia);
            if (!esValido)
            {
                throw new CustomException("Credenciales invalidas", 401);
            } 
            else
            {
                int rol = _usuarioRepositorio.GetRolByEmail(parametrosPeticion.Correo.ToLower());
                if (rol == 0)
                {
                    throw new CustomException("Rol no encontrado para el usuario", 400);
                }

                TokenServices tokenService = new TokenServices(_configuration);
                String NameUser = listaDatos[0].Nombre +" "+ listaDatos[0].Apellido;
                return tokenService.GenerateToken(parametrosPeticion.Correo.ToLower(), rol.ToString(), listaDatos[0].UsuarioId.ToString(),NameUser);
            }


        }

        public void CreateUser (UserRegistrationDTO.UserRegistrationParameter userRegistrationDTO, int UserId)
        {
            string PasswordHash = _userHelps.CreateHash(userRegistrationDTO.Contrasenia);
            userRegistrationDTO.Contrasenia = PasswordHash;
            UserRegistrationDTO newUser = new UserRegistrationDTO();
            newUser.Datos = userRegistrationDTO;
            newUser.UsuarioCreo = UserId;
            
            _usuarioRepositorio.CreateNewUser(newUser);
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            return await _usuarioRepositorio.EmailExistsAsync(email);
        }

    }
}
