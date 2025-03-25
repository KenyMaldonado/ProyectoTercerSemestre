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
        public IActionResult AuthUser(RegistroDTO.objAuthParameter parametrosPeticion)
        {
            try
            {
                bool estadoLogin = _usuarioBLL.AutenticarUsuario(parametrosPeticion);
                return Ok(estadoLogin);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }

    }

}
