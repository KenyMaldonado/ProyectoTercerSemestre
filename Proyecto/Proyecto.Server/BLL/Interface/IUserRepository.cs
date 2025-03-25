using System.Data;

namespace Proyecto.Server.BLL.Interface
{
    public interface IUserRepository
    {
        DataTable ObtenerCredenciales(string correo);
    }
}
