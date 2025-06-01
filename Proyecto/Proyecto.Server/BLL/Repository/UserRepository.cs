using System;
using System.Data;
using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;
using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;

namespace Proyecto.Server.BLL.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly StoreProcedure _storeProcedure;
        private readonly AppDbContext _dbContext;
        private readonly UserHelps _userHelps;
        public UserRepository(StoreProcedure storeProcedure, AppDbContext dbContext)
        {
            _storeProcedure = storeProcedure;
            _dbContext = dbContext;
            _userHelps = new UserHelps();
        }

        public UserRegistrationDTO.UserGetCredenciales? GetCredenciales(string email)
        {
            var consulta = _dbContext.Usuarios.Where(u => u.CorreoElectronico.ToLower() == email.ToLower() 
                && u.Estado == Usuario.EstadoUsuario.Activo).
                Select(u => new UserRegistrationDTO.UserGetCredenciales
                {
                    UsuarioId= u.UsuarioId,
                    Nombre = u.Nombre,
                    Apellido = u.Apellido,
                    Correo = u.CorreoElectronico,
                    Contrasenia = u.PasswordUser
                }).FirstOrDefault();

            return consulta;
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
                    {"@usuarioCreo", newUser.UsuarioCreo},
                    {"@token", newUser.Datos.TokenActivacion},
                    {"@tokenExpiracion", newUser.Datos.TokenExpiracion},
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


        public async Task<bool?> ActiveAccount(string token, string newPassword)
        {
            var newPasswordHash = _userHelps.CreateHash(newPassword);
            var usuariosConToken = await _dbContext.Usuarios
                .Where(u => u.TokenActivacion != null && u.Estado == Usuario.EstadoUsuario.Inactivo)
                .ToListAsync();

            foreach (var usuario in usuariosConToken)
            {
                if (_userHelps.VeryfyPassword(usuario.TokenActivacion, token))
                {
                    if (usuario.TokenExpiracion > DateTime.UtcNow)
                    {
                        usuario.Estado = Usuario.EstadoUsuario.Activo;
                        usuario.PasswordUser = newPasswordHash;
                        await _dbContext.SaveChangesAsync();
                        return true;
                    }
                    else
                    {
                        throw new CustomException("El token ha expirado", 401);
                    }
                }
            }

            // Si ningún token coincidió
            throw new CustomException("El token es inválido, inténtelo más tarde", 401);
        }


        public string GetRolByEmail(string email)
        {
            var lowerEmail = email.ToLower();
            var Rol = (from u in _dbContext.Usuarios
                          join r in _dbContext.TipoRols
                          on u.RolId equals r.RolId
                          where u.CorreoElectronico.ToLower() == lowerEmail
                          select r.Nombre).FirstOrDefault();

            return Rol.ToString();
        }

        public void UpdatePassword(int idUsuario, string correo, string newPassword)
        {
            var usuario = _dbContext.Usuarios.FirstOrDefault(u => u.UsuarioId == idUsuario);
            if (usuario != null)
            {
                usuario.PasswordUser = newPassword;
                _dbContext.SaveChanges();
            }
        }

        public bool InsertCode(CodigoDTO codigo)
        {
            try
            {
                var codigoNuevo = new CodigosVerificacion
                {
                    Codigo = codigo.CodigoHash,
                    FechaCreacion = codigo.FechaCreacion,
                    FechaExpiracion = codigo.FechaExpiracion,
                    UsuarioId = codigo.UsuarioId,
                    Usado = codigo.Usado,
                    TokenTemporal = codigo.TokenTemporal
                };

                _dbContext.Codigosverificacions.Add(codigoNuevo);
                _dbContext.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
            

        }
    
        public CodigoDTO? GetCodeVerification(string correo)
        {
            TimeZoneInfo zonaGuatemala = TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");
            var horaGuatemala = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, zonaGuatemala);

            var codigo = _dbContext.Codigosverificacions.Where(c => c.FechaExpiracion > horaGuatemala
                && c.Usado == false && c.Usuario.CorreoElectronico == correo.ToLower())
                .OrderByDescending(c => c.FechaExpiracion).FirstOrDefault();

            if (codigo == null)
            {
                return null;
            }
            else
            {
                return new CodigoDTO
                {
                    Codigo = codigo.Codigo,
                    FechaCreacion = codigo.FechaCreacion,
                    FechaExpiracion = codigo.FechaExpiracion,
                    Usado = codigo.Usado,
                    TokenTemporal = codigo.TokenTemporal
                };
            }
        }

        public void ChangePassword(int idUsuario, string passwordHash)
        {
            var usuario = _dbContext.Usuarios.FirstOrDefault(u => u.UsuarioId == idUsuario);

            if (usuario != null)
            {
                usuario.PasswordUser = passwordHash;
                _dbContext.SaveChanges();
            }
        }
    }
}
