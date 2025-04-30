namespace Proyecto.Server.Models
{
    public class CodigosVerificacion
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }

        public string Codigo { get; set; } = null!;

        public DateTime FechaCreacion { get; set; }

        public DateTime FechaExpiracion { get; set; }

        public bool Usado { get; set; }

        public string TokenTemporal { get; set; } = null!;

        public virtual Usuario Usuario { get; set; } = null!;
    }
}
