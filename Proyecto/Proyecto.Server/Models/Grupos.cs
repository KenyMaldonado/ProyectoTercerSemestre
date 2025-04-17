namespace Proyecto.Server.Models
{
    public class Grupos
    {
        public int GrupoId { get; set; }
        public string NombreGrupo { get; set; } = null!;
        public virtual ICollection<Equipo> Equipos { get; set; } = new List<Equipo>();
    }
}
