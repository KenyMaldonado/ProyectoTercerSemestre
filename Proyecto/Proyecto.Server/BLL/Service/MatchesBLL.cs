using System.Globalization;
using System.Linq;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.BLL.Interface.InterfacesService;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;
using Proyecto.Server.Utils; // Asegúrate de tener esta referencia si usas CustomException
using static Proyecto.Server.DTOs.EquipoDTO;
using static Proyecto.Server.DTOs.MatchesDTO;
using static Proyecto.Server.DTOs.TournamentDTO;

namespace Proyecto.Server.BLL.Service
{
    public class MatchesBLL : IMatchesBLL
    {
        private readonly IMatchesRepository _matchesRepository; // Corregí el nombre de la variable
        private readonly IConfiguration _configuration;

        public MatchesBLL(IMatchesRepository matchesRepository, IConfiguration configuration)
        {
            _matchesRepository = matchesRepository;
            _configuration = configuration;
        }

        public async Task<List<MatchesDTO.CanchaDTO>> GetCanchas()
        {
            return await _matchesRepository.GetCanchas();
        }

        public async Task UpdateCancha(MatchesDTO.CanchaDTO datos)
        {
            await _matchesRepository.UpdateCancha(datos);
        }

        public async Task DeleteCancha(int CanchaID)
        {
            await _matchesRepository.DeleteCancha(CanchaID);
        }

        public async Task CreateCancha(MatchesDTO.CanchaDTO datosNuevos)
        {
            await _matchesRepository.CreateCancha(datosNuevos);
        }

        public async Task IniciarTorneoTodosContraTodosAsync(StartTournamentRequest request)
        {
            // 1. Obtener torneo y validar fechas
            var torneo = await _matchesRepository.GetTorneoBySubtorneoAsync(request.SubtorneoId);
            if (torneo == null)
            {
                throw new CustomException("Torneo no encontrado para el subtorneo especificado.", 404);
            }

            var fechaInicioTorneo = torneo.FechaInicio.ToDateTime(TimeOnly.MinValue);
            var fechaFinTorneo = torneo.FechaFin.ToDateTime(TimeOnly.MinValue);

            // 2. Generar jornadas round-robin
            var jornadasGeneradas = GenerarJornadasRoundRobin(request.EquiposId);
            int totalPartidosRequeridos = jornadasGeneradas.Sum(j => j.Count);

            if (totalPartidosRequeridos == 0)
            {
                throw new CustomException("No se pueden generar partidos. Verifica los equipos proporcionados.", 400);
            }

            // 3. Cargar todos los recursos y partidos ya programados UNA SOLA VEZ
            var todasCanchas = await _matchesRepository.GetCanchasDisponiblesAsync(); // Obtiene canchas 'Disponibles'
            if (todasCanchas.Count == 0)
            {
                throw new CustomException("No hay canchas disponibles para el torneo.", 400);
            }

            var todosArbitros = await _matchesRepository.GetArbitrosDisponiblesGeneralAsync();

            // ¡IMPORTANTE! Cargar todos los partidos existentes en el rango de fechas para verificación en memoria
            var partidosExistentes = await _matchesRepository.GetPartidosProgramadosEnRangoAsync(fechaInicioTorneo, fechaFinTorneo);

            // Estructuras de datos para verificar disponibilidad en memoria (ocupación inicial por partidos ya existentes)
            // Key: (Fecha.Ticks, Hora.Ticks)
            // Value: HashSet de CanchaId ocupadas en ese slot
            var ocupacionCanchasGlobal = new Dictionary<(long, long), HashSet<int>>();
            // Value: HashSet de UsuarioId (árbitros) ocupados en ese slot
            var ocupacionArbitrosGlobal = new Dictionary<(long, long), HashSet<int>>();

            // Rellenar las estructuras de ocupación con los partidos existentes
            foreach (var partido in partidosExistentes)
            {
                var key = (partido.FechaPartido.Ticks, partido.HoraPartido.Ticks);

                if (!ocupacionCanchasGlobal.ContainsKey(key))
                {
                    ocupacionCanchasGlobal[key] = new HashSet<int>();
                }
                ocupacionCanchasGlobal[key].Add(partido.CanchaId);

                // Solo agregar a la ocupación de árbitros si el árbitro no es null
                if (partido.UsuarioId.HasValue) // Asumiendo que UsuarioId es nullable (int?) en tu modelo Partido
                {
                    if (!ocupacionArbitrosGlobal.ContainsKey(key))
                    {
                        ocupacionArbitrosGlobal[key] = new HashSet<int>();
                    }
                    ocupacionArbitrosGlobal[key].Add(partido.UsuarioId.Value);
                }
            }

            // 4. Pre-calcular los slots disponibles (Fecha, Hora) con sus canchas y árbitros iniciales
            // Las canchas y árbitros en estos slots representan los recursos realmente libres al inicio del cálculo.
            var fechasHorasSlotsConRecursos = new List<(DateTime fecha, TimeOnly hora, List<int> canchasIniciales, List<int> arbitrosIniciales)>();

            for (DateTime diaActual = fechaInicioTorneo; diaActual <= fechaFinTorneo; diaActual = diaActual.AddDays(1))
            {
                var diaNombre = diaActual.ToString("dddd", new CultureInfo("es-ES")).ToLower();

                if (!request.DiasPartidos.Any(d => d.Dia.ToLower() == diaNombre) || request.DiasOmitidos.Contains(DateOnly.FromDateTime(diaActual)))
                {
                    continue;
                }

                var diaRequest = request.DiasPartidos.First(d => d.Dia.ToLower() == diaNombre);

                foreach (var hora in diaRequest.Horarios)
                {
                    var key = (diaActual.Ticks, hora.Ticks);

                    var canchasOcupadasEnSlot = ocupacionCanchasGlobal.GetValueOrDefault(key, new HashSet<int>());
                    var arbitrosOcupadosEnSlot = ocupacionArbitrosGlobal.GetValueOrDefault(key, new HashSet<int>());

                    var canchasRealmenteLibres = todasCanchas
                                                .Where(c => !canchasOcupadasEnSlot.Contains(c.CanchaId))
                                                .Select(c => c.CanchaId)
                                                .ToList();

                    var arbitrosRealmenteLibres = todosArbitros
                                                    .Where(a => !arbitrosOcupadosEnSlot.Contains(a.UsuarioId))
                                                    .Select(a => a.UsuarioId)
                                                    .ToList();

                    if (canchasRealmenteLibres.Any()) // Solo necesitamos canchas disponibles
                    {
                        fechasHorasSlotsConRecursos.Add((diaActual, hora, canchasRealmenteLibres, arbitrosRealmenteLibres));
                    }
                }
            }

            // Validación de si hay suficientes "slots" generales para los partidos.
            int totalSlotsGeneralesDisponibles = fechasHorasSlotsConRecursos.Sum(fhd => fhd.canchasIniciales.Count); // Contamos solo canchas disponibles, no árbitros para esta estimación inicial

            if (totalSlotsGeneralesDisponibles < totalPartidosRequeridos)
            {
                throw new CustomException($"No hay suficientes fechas u horarios con canchas disponibles para programar los {totalPartidosRequeridos} partidos requeridos del torneo. Slots potenciales: {totalSlotsGeneralesDisponibles}. Considera añadir más fechas, horarios o canchas.", 400);
            }

            if (fechasHorasSlotsConRecursos.Count == 0)
            {
                throw new CustomException("No se encontraron fechas y horas disponibles con canchas para programar partidos dentro del rango del torneo.", 400);
            }

            // 5. Asignar partidos a fechas, canchas y árbitros
            int jornadaNumero = 1;
            int currentSlotIndex = 0; // Índice para recorrer los slots de fecha-hora disponibles

            // DECLARACIÓN CORRECTA: Estructuras de datos para gestionar la disponibilidad DINÁMICA
            var canchasOcupadasDinamicas = new Dictionary<(long, long), HashSet<int>>();
            var arbitrosOcupadasDinamicas = new Dictionary<(long, long), HashSet<int>>(); // <-- ¡Aquí estaba el error!

            var jornadasAGuardar = new List<Jornada>();
            var partidosAGuardar = new List<Partido>();

            foreach (var jornadaPartidos in jornadasGeneradas)
            {
                var nuevaJornada = new Jornada { NumeroJornada = jornadaNumero++};
                jornadasAGuardar.Add(nuevaJornada);

                foreach (var (equipo1, equipo2) in jornadaPartidos)
                {
                    bool partidoAsignado = false;

                    // Iterar sobre los slots de tiempo disponibles
                    while (!partidoAsignado && currentSlotIndex < fechasHorasSlotsConRecursos.Count)
                    {
                        var (fecha, hora, canchasIniciales, arbitrosIniciales) = fechasHorasSlotsConRecursos[currentSlotIndex];
                        var currentKey = (fecha.Ticks, hora.Ticks);

                        // Obtener canchas ocupadas en este slot para esta iteración dinámica
                        var ocupadasEnCurrentSlotCanchas = canchasOcupadasDinamicas.GetValueOrDefault(currentKey, new HashSet<int>());
                        var canchasDisponiblesAhora = canchasIniciales.Except(ocupadasEnCurrentSlotCanchas).ToList();

                        // Obtener árbitros ocupados en este slot para esta iteración dinámica
                        var ocupadosEnCurrentSlotArbitros = arbitrosOcupadasDinamicas.GetValueOrDefault(currentKey, new HashSet<int>()); // ¡Usando el nombre correcto!
                        var arbitrosDisponiblesAhora = arbitrosIniciales.Except(ocupadosEnCurrentSlotArbitros).ToList();

                        // Intentar asignar una cancha y un árbitro disponibles
                        int? canchaAsignadaId = null;
                        int? arbitroAsignadoId = null;

                        if (canchasDisponiblesAhora.Any())
                        {
                            canchaAsignadaId = canchasDisponiblesAhora.First(); // Toma la primera cancha disponible
                        }
                        else
                        {
                            // Si no hay canchas disponibles en este slot para este partido,
                            // intentamos con el siguiente slot de fecha/hora.
                            currentSlotIndex++;
                            continue;
                        }

                        // Asignar árbitro si hay disponible, de lo contrario será null
                        if (arbitrosDisponiblesAhora.Any())
                        {
                            arbitroAsignadoId = arbitrosDisponiblesAhora.First(); // Toma el primer árbitro disponible
                        }
                        // Si no hay árbitros, arbitroAsignadoId seguirá siendo null, lo cual es válido

                        // Si se pudo asignar una cancha (es obligatoria)
                        if (canchaAsignadaId.HasValue)
                        {
                            var partido = new Partido
                            {
                                Equipo1 = equipo1,
                                Equipo2 = equipo2,
                                FechaPartido = fecha,
                                HoraPartido = hora,
                                Estado = "Pendiente",
                                Jornada = nuevaJornada,
                                UsuarioId = arbitroAsignadoId, // Puede ser null
                                CanchaId = canchaAsignadaId.Value
                            };

                            partidosAGuardar.Add(partido);

                            // Marcar la cancha y árbitro como ocupados DINÁMICAMENTE para futuros partidos en este mismo slot
                            if (!canchasOcupadasDinamicas.ContainsKey(currentKey))
                                canchasOcupadasDinamicas[currentKey] = new HashSet<int>();
                            canchasOcupadasDinamicas[currentKey].Add(canchaAsignadaId.Value);

                            if (arbitroAsignadoId.HasValue) // Solo si se asignó un árbitro
                            {
                                if (!arbitrosOcupadasDinamicas.ContainsKey(currentKey))
                                    arbitrosOcupadasDinamicas[currentKey] = new HashSet<int>();
                                arbitrosOcupadasDinamicas[currentKey].Add(arbitroAsignadoId.Value);
                            }

                            partidoAsignado = true;
                        }

                        // Si el partido se asignó y aún quedan canchas disponibles en este slot,
                        // NO avanzar el currentSlotIndex. Permite que otros partidos usen las canchas restantes.
                        // Solo avanzamos si el slot ya no tiene canchas disponibles para futuros partidos.
                        if (partidoAsignado && canchasDisponiblesAhora.Count - (partidoAsignado ? 1 : 0) == 0)
                        {
                            currentSlotIndex++;
                        }
                        else if (!partidoAsignado)
                        {
                            currentSlotIndex++;
                        }
                    }

                    if (!partidoAsignado)
                    {
                        throw new CustomException($"No se pudo asignar el partido entre Equipo {equipo1} y Equipo {equipo2} por falta de slots disponibles (fecha, hora, cancha).", 500);
                    }
                }
            }

            // 6. Guardar todos los cambios en la base de datos de una sola vez
            await _matchesRepository.CrearJornadasYPartidosAsync(jornadasAGuardar, partidosAGuardar);
        }

        private List<List<(int equipo1, int equipo2)>> GenerarJornadasRoundRobin(List<int> equiposOriginales)
        {
            var equipos = new List<int>(equiposOriginales);
            var jornadas = new List<List<(int, int)>>();
            int n = equipos.Count;
            bool impar = n % 2 != 0;

            if (impar)
            {
                equipos.Add(-1);
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

                var ultimo = equipos[^1];
                equipos.RemoveAt(n - 1);
                equipos.Insert(1, ultimo);
            }

            return jornadas;
        }


        public async Task<List<MatchesDTO.GetPartidosByJornadaDTO>> GetPartidosBySubtorneo(int subtorneoID)
        {
            var jornadasDb = await _matchesRepository.GetJornadasWithPartidosAndDetailsBySubtorneoAsync(subtorneoID);

            if (jornadasDb == null || !jornadasDb.Any())
            {
                return new List<MatchesDTO.GetPartidosByJornadaDTO>();
            }

            var result = jornadasDb
                .Select(jornada => new MatchesDTO.GetPartidosByJornadaDTO
                {
                    NumeroJornada = jornada.NumeroJornada,
                    partidos = jornada.Partidos
                        .Where(p => (p.Equipo1Navigation != null && p.Equipo1Navigation.SubTorneoId == subtorneoID) ||
                                    (p.Equipo2Navigation != null && p.Equipo2Navigation.SubTorneoId == subtorneoID)) // <--- FILTRO ADICIONAL AQUÍ
                        .Select(partido => new MatchesDTO.PartidoDTO
                        {
                            PartidoId = partido.PartidoId,
                            FechaPartido = partido.FechaPartido,
                            HoraPartido = partido.HoraPartido,
                            Estado = partido.Estado,
                            Jornada = partido.Jornada.NumeroJornada,
                            FaseId = partido.FaseId,
                            // Nombre del árbitro: Accede a Usuario.NombreCompleto, si es nulo, "Sin asignar"
                            NameArbitro = partido.Usuario != null ?
                                          (partido.Usuario.Nombre ?? "") + " " + (partido.Usuario.Apellido ?? "") :
                                          "Sin asignar", // Ajusta a la propiedad de nombre real en tu Usuario

                            // Nombre de la cancha: Accede a Cancha.Name, si es nulo, "Desconocida"
                            NameCancha = partido.Cancha?.Nombre ?? "Desconocida",

                            // Mapeo del Equipo 1
                            equipo1 = partido.Equipo1Navigation != null ? new GetTeamDTO
                            {
                                EquipoId = partido.Equipo1Navigation.EquipoId,
                                Nombre = partido.Equipo1Navigation.Nombre,
                                NameFacultad = partido.Equipo1Navigation.Facultad?.Nombre ?? "Desconocida",
                                ImagenEquipo = partido.Equipo1Navigation.ImagenEquipo ?? ""
                            } : null,

                            // Mapeo del Equipo 2
                            equipo2 = partido.Equipo2Navigation != null ? new GetTeamDTO
                            {
                                EquipoId = partido.Equipo2Navigation.EquipoId,
                                Nombre = partido.Equipo2Navigation.Nombre,
                                NameFacultad = partido.Equipo2Navigation.Facultad?.Nombre ?? "Desconocida",
                                ImagenEquipo = partido.Equipo2Navigation.ImagenEquipo ?? ""
                            } : null
                        })
                        .OrderBy(p => p.FechaPartido)
                        .ThenBy(p => p.HoraPartido)
                        .ToList()
                })
                .ToList();

            return result;
        }


        public async Task UpdateEstadoSubtorneo(int subtorneoID)
        {
            await _matchesRepository.UpdateEstadoSubtorneo(subtorneoID);
        }

        public async Task<List<TablaPosicionesDto>> ObtenerTablaPosicionesAsync(int subTorneoId)
        {
            return await _matchesRepository.ObtenerTablaPosicionesAsync(subTorneoId);
        }

    }
}

