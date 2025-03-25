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
        private readonly UserHelps _userHelps = new UserHelps();
        public UserBLL(IUserRepository usuarioRepositorio)
        {
            _usuarioRepositorio = usuarioRepositorio;
        }

        public bool AuthenticateUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion)
        {
            DataTable dt = _usuarioRepositorio.GetCredentials(parametrosPeticion.Correo);

            if (dt.Rows.Count == 0)
                return false; // Usuario no encontrado

            var listaDatos = dt.AsEnumerable().Select(row => new UserRegistrationDTO.AuthRequestDTO
            {
                Correo = row.Field<string>(0),
                Contrasenia = row.Field<string>(1)
            }).ToList();

            return _userHelps.VeryfyPassword(listaDatos[0].Contrasenia, parametrosPeticion.Contrasenia);
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
    }
}
