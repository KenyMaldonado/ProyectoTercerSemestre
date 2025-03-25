using System.Data;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Service;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    [ApiController]
    public class AuthControllers : ControllerBase
    {
        private readonly StoreProcedure _dal;
        private readonly UsuarioServices _usarioServices;
        public AuthControllers(StoreProcedure dal)
        {
            _dal = dal;
        }

        [HttpGet("GetUser")]
        public IActionResult GetUser()
        {
            DataTable ds;
            Usuario.listaUsarios listaUsuario = new Usuario.listaUsarios();
            try
            {
                ds = (DataTable)_dal.EjecutarProcedimientoAlmacenado("VerTodosLosUsuarios", CommandType.StoredProcedure, null, null);
                List<Usuario.UsarioUnitario> usuario = ds.AsEnumerable().Select(row => new Usuario.UsarioUnitario()
                {
                    UsuarioId = row.Field<int>(0),
                    Nombre = row.Field<string>(1),
                    Apellido = row.Field<string>(2),
                    Contrasenia = row.Field<string>(3),
                    TipoRol = row.Field<string>(4),
                    Estado = row.Field<string>(5),
                    CorreoElectronico = row.Field<string>(7),
                    FechaCreacion = row.Field<DateTime>(6)

                }).ToList();
                listaUsuario.objListaUsuario = usuario;
                return Ok(listaUsuario);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("AuthUser")]
        public IActionResult AuthUser(RegistroDTO.objAuthParameter parametrosPeticion)
        {
            DataTable dt;
            bool EstadoLogin;
            try
            {
                var parametrosEntrada = new Dictionary<string, object>()
                {
                    {"@correo",parametrosPeticion.Correo}
                };

                dt = (DataTable)_dal.EjecutarProcedimientoAlmacenado("sp_getCredencialesUsuario",CommandType.StoredProcedure,parametrosEntrada,null);

                List<RegistroDTO.objAuthParameter> listaDatos = dt.AsEnumerable().Select(row  => new RegistroDTO.objAuthParameter 
                {
                    Correo = row.Field<string>(0),
                    Contrasenia = row.Field<string>(1)
                }).ToList();

                EstadoLogin = UsuarioServices.IncioUsuario(listaDatos[0].Contrasenia, parametrosPeticion.Contrasenia);

                return Ok(EstadoLogin);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
            
        }
    }
}
