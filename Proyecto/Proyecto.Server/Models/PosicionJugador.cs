namespace Proyecto.Server.Models
{
    public class PosicionJugador
    {
        public int PosicionId { get; set; }

        public string Nombre { get; set; } = null!;

        public string Abreviatura { get; set; } = null!;
        public virtual ICollection<JugadorEquipo> JugadorEquipos { get; set; } = new List<JugadorEquipo>();
    }
}
