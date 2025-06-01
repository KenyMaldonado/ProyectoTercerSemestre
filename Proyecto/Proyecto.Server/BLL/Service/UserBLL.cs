using Microsoft.Extensions.Configuration;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.BLL.Repository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils;
using System.Data;

namespace Proyecto.Server.BLL.Service
{
    /// <summary>
    /// 
    /// </summary>
    public class UserBLL : IUserBLL
    {
        private readonly IUserRepository _usuarioRepositorio;
        private readonly IConfiguration _configuration;
        private readonly UserHelps _userHelps = new UserHelps();
        private readonly CorreoServices _correoServices = new CorreoServices();
        private AppDbContext _appContext = new AppDbContext();
        TokenServices tokenService;

        public UserBLL(IUserRepository usuarioRepositorio, IConfiguration configuration)
        {
            _usuarioRepositorio = usuarioRepositorio;
            _configuration = configuration;
            tokenService = new TokenServices(_configuration);
        }
        public string AuthenticateUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion)
        {
            //DataTable dt = _usuarioRepositorio.GetCredentials(parametrosPeticion.Correo.ToLower());
            UserRegistrationDTO.UserGetCredenciales usuario = _usuarioRepositorio.GetCredenciales(parametrosPeticion.Correo.ToLower());
            if (usuario == null)
            {
                throw new CustomException("Usuario No encontrado", 404);
            }

            bool esValido = _userHelps.VeryfyPassword(usuario.Contrasenia, parametrosPeticion.Contrasenia);
            if (!esValido)
            {
                throw new CustomException("Credenciales invalidas", 401);
            } 
            else
            {
                string rol = _usuarioRepositorio.GetRolByEmail(parametrosPeticion.Correo.ToLower());
                if (string.IsNullOrEmpty(rol))
                {
                    throw new CustomException("Rol no encontrado para el usuario", 400);
                }

                String NameUser = usuario.Nombre +" "+ usuario.Apellido;
                return tokenService.GenerateToken(parametrosPeticion.Correo.ToLower(), rol, usuario.UsuarioId.ToString(),NameUser);
            }


        }

        public async Task CreateUser (UserRegistrationDTO.UserRegistrationParameter userRegistrationDTO, int UserId)
        {
            bool exitoso = false;
            try
            {
                // creamos el token
                var token = Guid.NewGuid().ToString();
                var tokenHash = _userHelps.CreateHash(token);

                userRegistrationDTO.TokenActivacion = tokenHash;
                userRegistrationDTO.Contrasenia = tokenHash;

                var expiration = DateTime.UtcNow.AddHours(24);
                userRegistrationDTO.TokenExpiracion = expiration;


                UserRegistrationDTO newUser = new UserRegistrationDTO();
                newUser.Datos = userRegistrationDTO;
                newUser.UsuarioCreo = UserId;

                _usuarioRepositorio.CreateNewUser(newUser);
                exitoso = await _correoServices.EnviarLinkActivarCuentaAsync(newUser.Datos.CorreoElectronico, token);
                if (exitoso == false)
                {
                    throw new CustomException("No se envio el correo, intentelo más tarde", 400);
                }

            }
            catch
            {

            }
            
            
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            return await _usuarioRepositorio.EmailExistsAsync(email);
        }

        public void UpdatePassword(string Correo, string Password, string NewPassword)
        {
            UserRegistrationDTO.UserGetCredenciales usuario = _usuarioRepositorio.GetCredenciales(Correo.ToLower());
            if (usuario != null) 
            {
                if(_userHelps.VeryfyPassword(usuario.Contrasenia, Password))
                {
                    string passwordHash = _userHelps.CreateHash(NewPassword);
                    _usuarioRepositorio.UpdatePassword(usuario.UsuarioId, Correo, passwordHash);
                }
                else
                {
                    throw new CustomException("Contraseña actual incorrecta", 401);
                }
            } 
            else
            {
                throw new CustomException("El usuario NO existe",404);
            }

        }

        public async Task LostPassword(string Correo)
        {
            UserRegistrationDTO.UserGetCredenciales? usuario = _usuarioRepositorio.GetCredenciales(Correo.ToLower());
            
            if (usuario == null)
                throw new CustomException("No existe ningun usuario Registrado con este Correo, intente de nuevo", 404);

            CodigoDTO NewCodigo = _correoServices.GenerarCodigo();
            NewCodigo.UsuarioId = usuario.UsuarioId;
            NewCodigo.CodigoHash = _userHelps.CreateHash(NewCodigo.Codigo);
            NewCodigo.TokenTemporal = tokenService.GenerateResetPasswordToken(NewCodigo.UsuarioId.ToString(), Correo);
            using (var transaction = await _appContext.Database.BeginTransactionAsync())
            {
                try
                {
                    bool insertar = _usuarioRepositorio.InsertCode(NewCodigo);
                    if (!insertar)
                    {
                        throw new CustomException("No se inserto correctamente el codigo", 400);
                    }

                    bool estadoEnviado = await _correoServices.EnviarCodigoVerificacionAsync(Correo, NewCodigo);
                    if (!estadoEnviado)
                    {
                        throw new CustomException("No se envio correctamente el correo, verifique", 500);
                    }   

                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
       
            
        }
    
        public string ValidacionCodigo(string correo, string codigo)
        {
            var codigoObtenido = _usuarioRepositorio.GetCodeVerification(correo);

            if (codigoObtenido == null)
            {
                throw new CustomException("No se encontró un código de verificación válido o ha expirado.", 404);
            }

            bool esValido = _userHelps.VeryfyPassword(codigoObtenido.Codigo, codigo);
            if (!esValido)
            {
                throw new CustomException("El codigo de verificacion no coincide con el enviado, verifique nuevamente", 401);
            }

            return codigoObtenido.TokenTemporal;

        }

        public void CambioPassword(string password, int UsuarioId)
        {
            try
            {
                string passwordHash = _userHelps.CreateHash(password);
                _usuarioRepositorio.ChangePassword(UsuarioId, passwordHash);
            }
            catch 
            {
                throw new CustomException("Error al actualizar su contraseña", 500);
            }
        }

        public async Task ActiveAccount(string token, string newPassword)
        {
            try
            {
                bool? estado = await _usuarioRepositorio.ActiveAccount(token, newPassword);

                if (estado != true) // null o false
                {
                    throw new CustomException("Token inválido o ya utilizado. Comuníquese con el administrador.", 401);
                }
            }
            catch (CustomException)
            {
                // Deja pasar las CustomException personalizadas del repositorio
                throw;
            }
            catch (Exception)
            {
                // Captura errores no controlados
                throw new CustomException("Ocurrió un error al activar la cuenta.", 500);
            }
        }



    }

}
