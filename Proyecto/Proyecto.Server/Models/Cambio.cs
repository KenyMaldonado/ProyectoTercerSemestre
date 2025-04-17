namespace Proyecto.Server.Models
{
    public class Cambio
    {
        public int CambioId { get; set; }
        public int? JugadorEntrada { get; set; }
        public int? JugadorSalida { get; set; }
        public int PartidoId { get; set; }
        public int? EquipoId { get; set; }
        public virtual Equipo? Equipo { get; set; }
        public virtual Jugador? JugadorEntradaNavigation { get; set; }
        public virtual Partido Partido { get; set; } = null!;
    }
}
