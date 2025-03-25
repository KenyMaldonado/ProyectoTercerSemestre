using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Interface
{
    public interface IUserBLL
    {
        public bool AutenticarUsuario(RegistroDTO.objAuthParameter parametrosPeticion);
    }
}
