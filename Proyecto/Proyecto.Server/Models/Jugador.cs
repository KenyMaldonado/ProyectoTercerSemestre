namespace Proyecto.Server.Models
{
    public class Jugador
    {
        public int JugadorId { get; set; }

        public string Nombre { get; set; } = null!;

        public string Apellido { get; set; } = null!;

        public int Carne { get; set; }

        public int EquipoId { get; set; }

        public int CarreraId { get; set; }

        public string? Fotografia { get; set; }

        public int PosicionId { get; set; }

        public string Estado { get; set; } = null!;
    }
}
