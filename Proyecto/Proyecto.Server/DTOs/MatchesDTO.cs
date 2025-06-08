namespace Proyecto.Server.DTOs
{
    public class MatchesDTO
    {
        public class CanchaDTO
        {
            public int CanchaId { get; set; }
            public string Nombre { get; set; } = null!;
            public int Capacidad { get; set; }
            public string Estado { get; set; } = null!;
        }
    }
}
