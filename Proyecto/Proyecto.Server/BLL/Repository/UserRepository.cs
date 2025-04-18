using System.Data;
using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;
using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;

namespace Proyecto.Server.BLL.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly StoreProcedure _storeProcedure;
        private readonly AppDbContext _dbContext;
        public UserRepository(StoreProcedure storeProcedure, AppDbContext dbContext)
        {
            _storeProcedure = storeProcedure;
            _dbContext = dbContext;
        }

        public DataTable GetCredentials(string email)
        {
            try
            {
                var parametrosEntrada = new Dictionary<string, object>
                {   
                    {"@correo",email}
                };

                return (DataTable)_storeProcedure.EjecutarProcedimientoAlmacenado("sp_getCredencialesUsuario", CommandType.StoredProcedure, parametrosEntrada);
            }
            catch (Exception ex)
            {
                throw new Exception("Error, no se encontro las credenciales del usuario" + ex.Message);
            }
        }

        public void CreateNewUser(UserRegistrationDTO newUser)
        {
            try
            {
                var parametrosEntrada = new Dictionary<string, object>
                {
                    {"@nombre", newUser.Datos.Nombre},
                    {"@apellido", newUser.Datos.Apellido},
                    {"@passwordUser",newUser.Datos.Contrasenia},
                    {"@rol",newUser.Datos.RolId},
                    {"@correo",newUser.Datos.CorreoElectronico.ToLower()},
                    {"@usuarioCreo", newUser.UsuarioCreo}
                };

                _storeProcedure.EjecutarProcedimientoAlmacenado("sp_createUser", CommandType.StoredProcedure, parametrosEntrada);
            }
            catch (Exception ex)
            {
                throw new Exception("Error, no se registro el usuario correctamente" + ex.Message);
            }

        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbContext.Usuarios.AnyAsync(u => u.CorreoElectronico == email);
        }

        public int GetRolByEmail(string email)
        {
            var lowerEmail = email.ToLower();

            var usuari = _dbContext.Usuarios
                .FirstOrDefault(u => u.CorreoElectronico.ToLower() == lowerEmail);

            if (usuari == null)
            {
                return 0;
            }

            return usuari.RolId;
        }



    }
}
