namespace Proyecto.Server.Models
{
    public class Departamento
    {
        public int DepartamentoId { get; set; }

        public string Nombre { get; set; } = null!;

        public virtual ICollection<Municipio> Municipios { get; set; } = new List<Municipio>();
    }
}
