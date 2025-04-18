using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Proyecto.Server.Utils
{
    public class TokenServices
    {
        private readonly IConfiguration _configuration;

        public TokenServices(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(string correo, string rol, string usuarioID, string nameUser)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]);

            var tokenHandler = new JwtSecurityTokenHandler();
            var now = DateTime.UtcNow;
            var expiration = now.AddHours(2);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuarioID),
                new Claim(JwtRegisteredClaimNames.Email, correo),
                new Claim(ClaimTypes.Role, rol),
                new Claim("UsuarioID", usuarioID),
                new Claim(ClaimTypes.Name,nameUser),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // ID único del token
                new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString())
                
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expiration,
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
