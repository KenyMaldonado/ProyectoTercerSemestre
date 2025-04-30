namespace Proyecto.Server.Models
{
    public class Municipio
    {
        public int MunicipioId { get; set; }

        public string Nombre { get; set; } = null!;

        public int? DepartamentoId { get; set; }

        public virtual Departamento? Departamento { get; set; }

        public virtual ICollection<Jugador> Jugadors { get; set; } = new List<Jugador>();
    }
}
