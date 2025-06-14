﻿using Proyecto.Server.Models;

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

        public class PartidoDTO
        {
            public int PartidoId { get; set; }

            public DateTime FechaPartido { get; set; }

            public TimeOnly HoraPartido { get; set; }
            public EquipoDTO.GetTeamDTO equipo1 { get; set; }
            public EquipoDTO.GetTeamDTO equipo2 { get; set; }

            public string Estado { get; set; } = null!;

            public int? Jornada { get; set; }

            public int? FaseId { get; set; }

            public string NameArbitro { get; set; }

            public string NameCancha {  get; set; }

        }

        public class GetPartidosByJornadaDTO
        {
            public int NumeroJornada { get; set; }
            public List<MatchesDTO.PartidoDTO> partidos {get; set; }
        }

        public class TablaPosicionesDto
        {
            public int EquipoId { get; set; }
            public string NombreEquipo { get; set; } = string.Empty;
            public string URLImagenEquipo { get; set; } = string.Empty;
            public int Puntos { get; set; }
            public int PartidosJugados { get; set; }
            public int PartidosGanados { get; set; }
            public int PartidosEmpatados { get; set; }
            public int PartidosPerdidos { get; set; }
            public int GolesAFavor { get; set; }
            public int GolesEnContra { get; set; }
            public int DiferenciaGoles { get; set; }
        }

        public class ResultadosPartido
        {
            public int PartidoID { get; set; }
            public List<MatchesDTO.GolDTO> golesPartido { get; set; }
            public List<MatchesDTO.TarjetaDTO> tarjetasPartido {  get; set; }
        }

        public class GolDTO
        {
            public int? MinutoGol { get; set; }

            public int? OrdenPenal { get; set; }

            public int ResultadoPartidoId { get; set; }

            public int JugadorId { get; set; }

            public int TipoGolId { get; set; }
        }
        public class TarjetaDTO
        {

            public int MinutoTarjeta { get; set; }

            public string? Descripcion { get; set; }

            public string? Estado { get; set; }

            public string TipoTarjeta { get; set; } = null!;

            public int ResultadoPartidoId { get; set; }

            public int JugadorId { get; set; }
        }
    }
}
