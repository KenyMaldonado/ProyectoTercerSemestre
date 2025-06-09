using System.Globalization;
using System.Linq;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using static Proyecto.Server.DTOs.TournamentDTO;

namespace Proyecto.Server.BLL.Service
{
    public class MatchesBLL : IMatchesBLL
    {
        private readonly IMatchesRepository _matchaesRepository;
        private readonly IConfiguration _configuration;

        public MatchesBLL(IMatchesRepository matchesRepository, IConfiguration configuration)
        {
            _matchaesRepository = matchesRepository;
            _configuration = configuration;
        }

        public async Task<List<MatchesDTO.CanchaDTO>> GetCanchas()
        {
            return await _matchaesRepository.GetCanchas();
        }

        public async Task UpdateCancha(MatchesDTO.CanchaDTO datos)
        {
            await _matchaesRepository.UpdateCancha(datos);
        }

        public async Task DeleteCancha(int CanchaID)
        {
            await _matchaesRepository.DeleteCancha(CanchaID);
        }

        public async Task CreateCancha(MatchesDTO.CanchaDTO datosNuevos)
        {
            await _matchaesRepository.CreateCancha(datosNuevos);
        }

        public async Task IniciarTorneoTodosContraTodosAsync(StartTournamentRequest request)
        {
            // 1. Obtener torneo y validar fechas
            var torneo = await _matchaesRepository.GetTorneoBySubtorneoAsync(request.SubtorneoId);
            if (torneo == null) throw new Exception("Torneo no encontrado para el subtorneo.");

            var fechaInicio = torneo.FechaInicio;
            var fechaFin = torneo.FechaFin;

            var diasPermitidos = request.DiasPartidos.Select(d => d.Dia.ToLower()).ToHashSet();
            var diasOmitidos = request.DiasOmitidos;

            var canchas = await _matchaesRepository.GetCanchasDisponiblesAsync();
            if (canchas.Count == 0) throw new Exception("No hay canchas disponibles.");

            var equipos = request.EquiposId;
            if (equipos.Count < 2) throw new Exception("Se necesitan al menos 2 equipos.");

            // 2. Generar jornadas round-robin
            var jornadas = GenerarJornadasRoundRobin(equipos);

            // 3. Construir lista fechas+horas disponibles (DateTime + TimeOnly)
            var fechasDisponibles = new List<(DateTime fecha, TimeOnly hora)>();

            var fechaInicioDT = fechaInicio.ToDateTime(TimeOnly.MinValue);
            var fechaFinDT = fechaFin.ToDateTime(TimeOnly.MinValue);

            for (DateTime dia = fechaInicioDT; dia <= fechaFinDT; dia = dia.AddDays(1))
            {
                var diaNombre = dia.ToString("dddd", new CultureInfo("es-ES")).ToLower();

                if (!diasPermitidos.Contains(diaNombre)) continue;

                if (diasOmitidos.Contains(DateOnly.FromDateTime(dia))) continue;

                var diaRequest = request.DiasPartidos.FirstOrDefault(d => d.Dia.ToLower() == diaNombre);
                if (diaRequest == null) continue;

                foreach (var hora in diaRequest.Horarios)
                {
                    fechasDisponibles.Add((dia, hora));
                }
            }

            int partidosTotal = jornadas.Sum(j => j.Count);
            int espaciosDisponibles = fechasDisponibles.Count * canchas.Count;

            if (espaciosDisponibles < partidosTotal)
                throw new Exception("No hay suficientes espacios para todos los partidos.");

            // 4. Asignar partidos a fechas, canchas y árbitros
            int jornadaNumero = 1;
            int fechaIndex = 0;

            foreach (var jornada in jornadas)
            {
                var nuevaJornada = new Jornada { NumeroJornada = jornadaNumero++ };
                await _matchaesRepository.CrearJornadaAsync(nuevaJornada);

                foreach (var (equipo1, equipo2) in jornada)
                {
                    bool asignado = false;

                    // Intentar asignar el partido a una fecha, cancha y árbitro disponibles
                    while (!asignado && fechaIndex < fechasDisponibles.Count)
                    {
                        var (fecha, hora) = fechasDisponibles[fechaIndex];

                        foreach (var cancha in canchas)
                        {
                            bool canchaLibre = await _matchaesRepository.IsCanchaDisponibleAsync(cancha.CanchaId, fecha, hora);
                            if (!canchaLibre) continue;

                            var arbitros = await _matchaesRepository.GetArbitrosDisponiblesAsync(fecha, hora);
                            var arbitro = arbitros.FirstOrDefault();

                            if (arbitro == null) continue; // Sin árbitro, pruebo otra cancha o fecha

                            var partido = new Partido
                            {
                                Equipo1 = equipo1,
                                Equipo2 = equipo2,
                                FechaPartido = fecha,
                                HoraPartido = hora,
                                Estado = "Pendiente",
                                Jornada = nuevaJornada,
                                UsuarioId = arbitro.UsuarioId,
                                CanchaId = cancha.CanchaId
                            };

                            await _matchaesRepository.CrearPartidoAsync(partido);
                            asignado = true;
                            break; // partido asignado, salgo del foreach cancha
                        }

                        if (!asignado)
                            fechaIndex++; // paso a la siguiente fecha si no pude asignar en esta fecha
                    }

                    if (!asignado)
                        throw new Exception($"No se pudo asignar partido entre {equipo1} y {equipo2} por falta de espacio disponible.");
                }
            }

            await _matchaesRepository.GuardarCambiosAsync();
        }

        private List<List<(int equipo1, int equipo2)>> GenerarJornadasRoundRobin(List<int> equipos)
        {
            var jornadas = new List<List<(int, int)>>();
            int n = equipos.Count;
            bool impar = n % 2 != 0;

            if (impar)
            {
                equipos.Add(-1); // Equipo ficticio para descanso
                n++;
            }

            int rondas = n - 1;
            int mitad = n / 2;

            for (int ronda = 0; ronda < rondas; ronda++)
            {
                var jornada = new List<(int, int)>();

                for (int i = 0; i < mitad; i++)
                {
                    int e1 = equipos[i];
                    int e2 = equipos[n - 1 - i];

                    if (e1 != -1 && e2 != -1)
                        jornada.Add((e1, e2));
                }

                jornadas.Add(jornada);

                // Rotar equipos excepto el primero
                var ultimo = equipos[^1];
                equipos.RemoveAt(n - 1);
                equipos.Insert(1, ultimo);
            }

            return jornadas;
        }
    }
}
