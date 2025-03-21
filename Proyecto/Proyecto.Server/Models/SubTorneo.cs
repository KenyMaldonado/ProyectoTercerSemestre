namespace Proyecto.Server.Models
{
    public class SubTorneo
    {
        public int SubTorneoId { get; set; }
        public string Categoria { get; set; } = null!;
        public int TorneoId { get; set; }
    }
}
