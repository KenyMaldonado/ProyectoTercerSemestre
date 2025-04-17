namespace Proyecto.Server.Models
{
    public class TipoTorneo
    {
        public int TipoTorneoId { get; set; }
        public string Nombre { get; set; } = null!;
        public string Descripcion { get; set; } = null!;
        public virtual ICollection<Torneo> Torneos { get; set; } = new List<Torneo>();
    }
}
