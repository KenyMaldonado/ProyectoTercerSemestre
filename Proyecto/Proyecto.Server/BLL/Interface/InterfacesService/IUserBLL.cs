using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface.InterfacesService
{
    public interface IUserBLL
    {
        public string AuthenticateUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion);
        void CreateUser(UserRegistrationDTO.UserRegistrationParameter userRegistrationDTO, int UserId);
        Task<bool> IsEmailRegisteredAsync(string email);
        void UpdatePassword(string Correo, string Password, string NewPassword);
        Task LostPassword(string Correo);
        string ValidacionCodigo(string correo, string codigo);
        void CambioPassword(string password, int UsuarioId);
    }
}
