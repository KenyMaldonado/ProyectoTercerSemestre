using System.Data;
using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;
using Proyecto.Server.BLL.Interface;
using Proyecto.Server.DAL;

namespace Proyecto.Server.BLL.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly StoreProcedure _storeProcedure;
        public UserRepository(StoreProcedure storeProcedure)
        {
            _storeProcedure = storeProcedure;
        }

        public DataTable ObtenerCredenciales(string correo)
        {
            try
            {
                var parametrosEntrada = new Dictionary<string, object>
                {   
                    {"@correo",correo}
                };

                return (DataTable)_storeProcedure.EjecutarProcedimientoAlmacenado("sp_getCredencialesUsuario", CommandType.StoredProcedure, parametrosEntrada, null);
            }
            catch (Exception ex)
            {
                throw new Exception("Error, no se encontro las credenciales del usuario" + ex.Message);
            }


        }




    }
}
