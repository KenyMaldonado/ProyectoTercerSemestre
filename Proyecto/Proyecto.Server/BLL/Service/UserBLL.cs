using Proyecto.Server.BLL.Interface;
using Proyecto.Server.DTOs;
using System.Data;

namespace Proyecto.Server.BLL.Service
{
    public class UserBLL : IUserBLL
    {
        private readonly IUserRepository _usuarioRepositorio;

        public UserBLL(IUserRepository usuarioRepositorio)
        {
            _usuarioRepositorio = usuarioRepositorio;
        }

        public bool AutenticarUsuario(RegistroDTO.objAuthParameter parametrosPeticion)
        {
            DataTable dt = _usuarioRepositorio.ObtenerCredenciales(parametrosPeticion.Correo);

            if (dt.Rows.Count == 0)
                return false; // Usuario no encontrado

            var listaDatos = dt.AsEnumerable().Select(row => new RegistroDTO.objAuthParameter
            {
                Correo = row.Field<string>(0),
                Contrasenia = row.Field<string>(1)
            }).ToList();

            return UsuarioServices.IncioUsuario(listaDatos[0].Contrasenia, parametrosPeticion.Contrasenia);
        }
    }
}
