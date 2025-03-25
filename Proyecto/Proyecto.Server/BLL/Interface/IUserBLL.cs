using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    public interface IUserBLL
    {
        public bool AuthenticateUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion);
        public void CreateUser(UserRegistrationDTO userRegistrationDTO);
        Task<bool> IsEmailRegisteredAsync(string email);
    }
}
