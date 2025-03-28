using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    public interface IUserBLL
    {
        public string AuthenticateUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion);
        void CreateUser(UserRegistrationDTO.UserRegistrationParameter userRegistrationDTO, int UserId);
        Task<bool> IsEmailRegisteredAsync(string email);
    }
}
