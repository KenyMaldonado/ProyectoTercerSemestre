using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    /// <summary>
    /// 
    /// </summary>
    public interface IUserBLL
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="parametrosPeticion"></param>
        /// <returns></returns>
        public string AuthenticateUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion);
        /// <summary>
        /// 
        /// </summary>
        /// <param name="userRegistrationDTO"></param>
        /// <param name="UserId"></param>
        void CreateUser(UserRegistrationDTO.UserRegistrationParameter userRegistrationDTO, int UserId);
        /// <summary>
        /// 
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        Task<bool> IsEmailRegisteredAsync(string email);
    }
}
