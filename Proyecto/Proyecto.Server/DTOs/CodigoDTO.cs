namespace Proyecto.Server.DTOs
{
    public class CodigoDTO
    {

        public int UsuarioId { get; set; }

        public string Codigo { get; set; } = null!;

        public string CodigoHash { get; set; } = null!;

        public DateTime FechaCreacion { get; set; }

        public DateTime FechaExpiracion { get; set; }

        public bool Usado { get; set; }

        public string TokenTemporal { get; set; } = null!;
    }
}
