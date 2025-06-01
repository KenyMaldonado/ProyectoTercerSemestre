using System.Data;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Proyecto.Server.BLL.Service;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.BLL;
using Microsoft.AspNetCore.Authorization;
using Proyecto.Server.Utils;
using System.Security.Claims;
using Proyecto.Server.BLL.Interface.InterfacesService;

namespace Proyecto.Server.Controllers
{

    /// <summary>
    /// Controlador responsable de la autenticación de usuarios.
    /// </summary>
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class AuthControllers : ControllerBase
    {
        private readonly IUserBLL _usuarioBLL;
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="usuarioBLL"></param>
        public AuthControllers(IUserBLL usuarioBLL)
        {
            _usuarioBLL = usuarioBLL;
        }

        /// <summary>
        /// Este método autentica a un usuario mediante su solicitud de autenticación.
        /// </summary>
        /// <param name="parametrosPeticion">Parámetros necesarios para autenticar al usuario (incluye el correo electrónico y la contraseña).</param>
        /// <returns>Un token JWT que puede ser utilizado para autenticar futuras solicitudes.</returns>
        /// <response code="200">Devuelve el token JWT si la autenticación es exitosa.</response>
        /// <response code="400">Si los parámetros de autenticación son incorrectos o si ocurre un error interno.</response>
        /// <response code="401">Si el usuario no está autorizado.</response>
        /// <response code="404">Si el usuario no se encuentra.</response>

        [HttpPost("AuthUser")]
        public IActionResult AuthUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion)
        {
            try
            {
                string token = _usuarioBLL.AuthenticateUser(parametrosPeticion);
                return ResponseHelper.Success("Autenticación exitosa", new { Token = token });
            }
            catch (CustomException ex)
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            catch (Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }
        }

        /// <summary>
        /// Crea un nuevo usuario en el sistema. Solo los usuarios con el rol "Admin" pueden ejecutar este método.
        /// </summary>
        /// <param name="parametrosPeticion">El parámetro que contiene los datos necesarios para crear el nuevo usuario.</param>
        /// <returns>Un IActionResult que indica si la operación fue exitosa, o el motivo de un error.</returns>
        /// <response code="201">Usuario creado exitosamente.</response>
        /// <response code="401">Si el ID del usuario no se puede obtener desde el token.</response>
        /// <response code="409">Si el correo electrónico del usuario ya está registrado.</response>
        /// <response code="400">Si ocurre un error inesperado al procesar la solicitud.</response>

        [Authorize(Roles = "Admin")]
        [HttpPost("CreateNewUser")]

        public async Task<IActionResult> CreateNewUser(UserRegistrationDTO.UserRegistrationParameter parametrosPeticion)
        {
            try
            {
                var userId = User.GetUsuarioId();

                if (userId == null)
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No se pudo obtener el ID del usuario.", 401));
                }

                if (await _usuarioBLL.IsEmailRegisteredAsync(parametrosPeticion.CorreoElectronico.ToLower()))
                {
                    return ResponseHelper.HandleCustomException(new CustomException("El usuario ya existe.", 409));
                }
                
                    await _usuarioBLL.CreateUser(parametrosPeticion,userId.Value);
                return ResponseHelper.Created("Usuario creado exitosamente");


            }
            catch (CustomException ex) 
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            catch (Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }
        }


        [HttpPatch("ActiveAccount")]
        public async Task<IActionResult> ActiveAccount(string Token, string NewPassword)
        {
            try
            {
                await _usuarioBLL.ActiveAccount(Token, NewPassword);
                return ResponseHelper.Success("La cuenta fue activada exitosamente");

            }
            catch (CustomException ex)
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            catch (Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }
        }


        [Authorize(Roles = "Admin")]
        [HttpPatch("UpdatePasswordWithLogin")]
        public IActionResult UpdatePasswordWithLogin(string currentPassword, string newPassword)
        {
            try
            {
                var userEmail = User.GetCorreo();
                if (userEmail == null)
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No se puedo obtener el correo, verique el JWT", 401));
                }

                _usuarioBLL.UpdatePassword(userEmail, currentPassword, newPassword);
                return ResponseHelper.Success("Se actualizo correctamente");
            }
            catch (CustomException ex)
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            catch (Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }
        }

        [HttpPost("LostPassword")]
        public async Task<IActionResult> LostPassword(string correo)
        {
            try
            {
                await _usuarioBLL.LostPassword(correo);
                return ResponseHelper.Success("Se envio el correo exitosamente, verifique tambien su bandeja de spam");
            }
            catch (CustomException ex)
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            
        }

        [HttpPost("VerifyCode")]
        public IActionResult verifyCode(string code,string correo)
        {
            try
            {
                string token = _usuarioBLL.ValidacionCodigo(correo, code);
                return ResponseHelper.Success("Verificación exitosa",token);
                
            }
            catch (CustomException ex) 
            {
                return ResponseHelper.HandleCustomException(ex);
            }
            catch (Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }



        }

        [Authorize(Policy = "ResetPassword")]
        [HttpPatch("UpdatePasswordWithToken")]
        public IActionResult UpdatePasswordWithToken(string password)
        {
            try
            {
                var usuarioID = User.GetUsuarioId();
                if (usuarioID == null) 
                {
                    return ResponseHelper.HandleCustomException(new CustomException("No se puedo obtener el UsuarioID, verique el JWT", 401));
                }
                _usuarioBLL.CambioPassword(password, usuarioID.Value);
                return ResponseHelper.Success("Se ha actualizado su contraseña correctamente");

            }
            catch (CustomException ex)
            {
                return ResponseHelper.HandleCustomException(ex);
            } 
            catch (Exception ex)
            {
                return ResponseHelper.HandleGeneralException(ex);
            }
            
            
            

        }
    }

}
