using System.Data;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Proyecto.Server.BLL.Service;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.BLL;
using Proyecto.Server.BLL.Interface;
using Microsoft.AspNetCore.Authorization;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class AuthControllers : ControllerBase
    {
        private readonly IUserBLL _usuarioBLL;
        public AuthControllers(IUserBLL usuarioBLL)
        {
            _usuarioBLL = usuarioBLL;
        }

        [HttpPost("AuthUser")]
        public IActionResult AuthUser(UserRegistrationDTO.AuthRequestDTO parametrosPeticion)
        {
            try
            {
                string token = _usuarioBLL.AuthenticateUser(parametrosPeticion);
                if (token == null)
                    return Unauthorized("Credenciales inválidas");

                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("CreateNewUser")]

        public async Task<IActionResult> CreateNewUser(UserRegistrationDTO parametrosPeticion)
        {
            try
            {
                if (await _usuarioBLL.IsEmailRegisteredAsync(parametrosPeticion.CorreoElectronico))
                {
                    return Conflict("El usuario Ya existe");
                } else
                {
                    _usuarioBLL.CreateUser(parametrosPeticion);
                    return Created("","Usuario Creado Exitosamente");
                }
                
            }
            catch (Exception ex) 
            { 
                return BadRequest(ex.Message);
            }
        }
    }

}
