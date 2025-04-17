namespace Proyecto.Server.Models
{
    public class TipoGol
    {
        public int TipoGolId { get; set; }

        public string Nombre { get; set; } = null!;

        public string Descripcion { get; set; } = null!;

        public virtual ICollection<Goles> Goles { get; set; } = new List<Goles>();
    }
}
