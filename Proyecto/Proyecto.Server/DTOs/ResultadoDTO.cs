namespace Proyecto.Server.DTOs
{
    public class ResultadoDTO
    {
        public class PartidoDetalladoDTO
        {
            public int PartidoId { get; set; }
            public DateTime FechaPartido { get; set; }
            public TimeOnly HoraPartido { get; set; }
            public string Estado { get; set; }

            public string Equipo1Nombre { get; set; }
            public string Equipo2Nombre { get; set; }

            public int GolesEquipo1 { get; set; }
            public int GolesEquipo2 { get; set; }

            public List<GolDTO> Goles { get; set; }
            public List<TarjetaDTO> Tarjetas { get; set; }
        }

        public class GolDTO
        {
            public int MinutoGol { get; set; }
            public bool EsTiempoExtra { get; set; }
            public int? OrdenPenal { get; set; }
            public string JugadorNombre { get; set; }
            public string TipoGol { get; set; }
            public string? ImagenJugador { get; set; } // NUEVO
        }

        public class TarjetaDTO
        {
            public int MinutoTarjeta { get; set; }
            public string TipoTarjeta { get; set; }
            public string? Descripcion { get; set; }
            public string JugadorNombre { get; set; }
        }

    }
}
