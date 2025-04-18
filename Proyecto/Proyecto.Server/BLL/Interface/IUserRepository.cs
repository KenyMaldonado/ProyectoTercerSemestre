using System.Data;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    public interface IUserRepository
    {
        DataTable GetCredentials(string correo);
        void CreateNewUser(UserRegistrationDTO newUser);
        Task<bool> EmailExistsAsync(string email);
        int GetRolByEmail(string email);
    }
}
