using System.Data;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface IUserRepository
    {
        void CreateNewUser(UserRegistrationDTO newUser);
        Task<bool> EmailExistsAsync(string email);
        string GetRolByEmail(string email);
        UserRegistrationDTO.UserGetCredenciales? GetCredenciales(string email);
        void UpdatePassword(int idUsuario, string correo, string newPassword);
        bool InsertCode(CodigoDTO codigo);
        CodigoDTO? GetCodeVerification(string correo);
        void ChangePassword(int idUsuario, string passwordHash);
    }
}
