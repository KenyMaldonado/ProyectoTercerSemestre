using System.Data;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Proyecto.Server.DAL;
using Proyecto.Server.Models;

namespace Proyecto.Server.Controllers
{
    [Microsoft.AspNetCore.Components.Route("api/[controller]")]
    [ApiController]
    public class AuthControllers : ControllerBase
    {
        private readonly StoreProcedure _dal;
        public AuthControllers(StoreProcedure dal) 
        { 
            _dal = dal;
        }

        [HttpGet("GetUser")]
        public IActionResult GetUser ()
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

    }
}
