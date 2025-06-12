using System.Security.Claims;

namespace Proyecto.Server.Utils
{
    public static class ClaimsHelper
    {
        public static int? GetUsuarioId(this ClaimsPrincipal user)
        {
            var claim = user.FindFirst("UsuarioID");
            return claim != null ? int.Parse(claim.Value) : null;
        }

        public static string? GetRol(this ClaimsPrincipal user)
        {
            var claim = user.FindFirst(ClaimTypes.Role);
            return claim?.Value;
        }

        public static string? GetCorreo(this ClaimsPrincipal user)
        {
            var claim = user.FindFirst(ClaimTypes.Email);
            return claim?.Value;
        }
    }
}
