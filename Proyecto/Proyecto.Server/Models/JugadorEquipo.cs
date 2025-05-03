namespace Proyecto.Server.Models
{
    public class JugadorEquipo
    {
        public int JugadorEquipoId { get; set; }

        public int JugadorId { get; set; }

        public int EquipoId { get; set; }

        public int PosicionId { get; set; }

        public int Dorsal { get; set; }

        public bool Estado { get; set; }

        public virtual Equipo Equipo { get; set; } = null!;

        public virtual Jugador Jugador { get; set; } = null!;

        public virtual PosicionJugador Posicion { get; set; } = null!;
    }
}
