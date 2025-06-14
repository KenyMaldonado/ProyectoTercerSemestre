﻿using Microsoft.EntityFrameworkCore;
using Proyecto.Server.BLL.Interface.InterfacesRepository;
using Proyecto.Server.DAL;
using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Repository
{
    public class PlayerRepository : IPlayerRepository
    {
        private readonly AppDbContext _appDbContext;

        public PlayerRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public List<JugadorDTO.VerifyPlayers> VerifyPlayers(List<int> carnets)
        {
            // Obtener jugadores existentes con los carnets especificados, incluyendo las relaciones necesarias
            var jugadoresExistentes = _appDbContext.Jugadors
                .Where(j => carnets.Contains(j.Carne))
                .Include(j => j.Municipio)
                    .ThenInclude(m => m.Departamento)
                .Include(j => j.CarreraSemestre)
                .AsEnumerable()
                .Select(j => new JugadorDTO
                {
                    Nombre = j.Nombre,
                    Apellido = j.Apellido,
                    JugadorId = j.JugadorId,
                    Carne = j.Carne,
                    Fotografia = j.Fotografia,
                    MunicipioId = j.MunicipioId,
                    MunicipioName = j.Municipio?.Nombre ?? "Sin municipio",
                    DepartamentoId = j.Municipio?.DepartamentoId ?? 0,
                    DepartamentoName = j.Municipio?.Departamento?.Nombre ?? "Sin departamento",
                    CarreraId = j.CarreraSemestre?.CarreraId1 ?? 0,
                    Semestre = j.CarreraSemestre?.Semestre ?? 0,
                    Seccion = j.CarreraSemestre?.Seccion ?? "Sin sección",
                    CodigoCarrera = j.CarreraSemestre?.CodigoCarrera ?? "N/A",
                    CarreraSemestreId = j.CarreraSemestreId,
                    FechaNacimiento = j.FechaNacimiento,
                    Edad = j.Edad,
                    Telefono = j.Telefono,
                    EstadoTexto = Enum.GetName(typeof(JugadorDTO.EstadoJugador), j.Estado),
                    Estado = (JugadorDTO.EstadoJugador)j.Estado
                })
                .ToList();

            // Generar la lista de resultados de verificación
            var resultado = carnets.Select(c =>
            {
                var jugador = jugadoresExistentes.FirstOrDefault(j => j.Carne == c);

                // No existe jugador con ese carné
                if (jugador == null)
                {
                    return new JugadorDTO.VerifyPlayers
                    {
                        datosJugador = new JugadorDTO(), // Se devuelve objeto vacío
                        aprobado = true
                    };
                }

                // El jugador existe, pero no está en estado "Libre"
                if (jugador.Estado != JugadorDTO.EstadoJugador.Libre)
                {
                    return new JugadorDTO.VerifyPlayers
                    {
                        datosJugador = null,
                        aprobado = false
                    };
                }

                // Jugador existe y está disponible
                return new JugadorDTO.VerifyPlayers
                {
                    datosJugador = jugador,
                    aprobado = true
                };
            }).ToList();

            return resultado;
        }


        public List<JugadorDTO> GetJugadoresByTeam(int TeamId)
        {
            var Jugadores = _appDbContext.JugadorEquipos
                            .Where(j => j.EquipoId == TeamId && j.Estado == true)
                            .Select(j => new JugadorDTO
                            {
                                JugadorId = j.JugadorId,
                                Carne = j.Jugador.Carne,
                                Nombre = j.Jugador.Nombre,
                                Apellido = j.Jugador.Apellido,
                                Fotografia = j.Jugador.Fotografia,
                                Estado = (JugadorDTO.EstadoJugador)j.Jugador.Estado,
                                MunicipioId = j.Jugador.MunicipioId,
                                MunicipioName = j.Jugador.Municipio.Nombre,
                                DepartamentoId = j.Jugador.Municipio.DepartamentoId,
                                DepartamentoName = j.Jugador.Municipio.Departamento.Nombre,
                                CarreraSemestreId = j.Jugador.CarreraSemestreId,
                                CarreraId = j.Jugador.CarreraSemestre.CarreraId1,
                                CarreraName = j.Jugador.CarreraSemestre.CarreraId1Navigation.Nombre,
                                CodigoCarrera = j.Jugador.CarreraSemestre.CodigoCarrera,
                                Semestre = j.Jugador.CarreraSemestre.Semestre,
                                Seccion = j.Jugador.CarreraSemestre.Seccion,
                                FechaNacimiento = j.Jugador.FechaNacimiento,
                                Edad = j.Jugador.Edad,
                                Telefono = j.Jugador.Telefono,
                                asignacion = new JugadorDTO.JugadorEquipoDTO
                                {
                                    EquipoId = j.EquipoId,
                                    PosicionId = j.PosicionId,
                                    PosicionName = j.Posicion.Nombre,
                                    Dorsal = j.Dorsal,
                                    Estado = j.Estado,
                                    FacultadID = j.Equipo.FacultadId
                                }
                            });
            return Jugadores.ToList();
        }

        public async Task<List<JugadorDTO.PosicionJugadorDTO>> GetPosicionesJugadores()
        {
            var consulta = await _appDbContext.PosicionJugadors
                            .Select(j => new JugadorDTO.PosicionJugadorDTO
                            {
                                PosicionId = j.PosicionId,
                                NombrePosicion = j.Nombre,
                                Abreviatura = j.Abreviatura
                            }).ToListAsync();
            return consulta;
        }

        public async Task<int> CountPlayers()
        {
            return await _appDbContext.JugadorEquipos
                .Where(j => j.Estado == true)
                .Select(j => j.JugadorId)
                .Distinct()
                .CountAsync();
        }

        public async Task<List<JugadorDTO>> GetPLayers(int pageNumber, int pageSize)
        {
            var jugadores = await _appDbContext.JugadorEquipos
                            .Where(j => j.Estado == true)
                            .OrderBy(j => j.Jugador.Apellido)
                            .Skip((pageNumber - 1) * pageSize)
                            .Take(pageSize)
                            .Select(j => new JugadorDTO
                            {
                                JugadorId = j.JugadorId,
                                Carne = j.Jugador.Carne,
                                Nombre = j.Jugador.Nombre,
                                Apellido = j.Jugador.Apellido,
                                Fotografia = j.Jugador.Fotografia,
                                Estado = (JugadorDTO.EstadoJugador)j.Jugador.Estado,
                                MunicipioId = j.Jugador.MunicipioId,
                                MunicipioName = j.Jugador.Municipio.Nombre,
                                DepartamentoId = j.Jugador.Municipio.DepartamentoId,
                                DepartamentoName = j.Jugador.Municipio.Departamento.Nombre,
                                CarreraSemestreId = j.Jugador.CarreraSemestreId,
                                CarreraId = j.Jugador.CarreraSemestre.CarreraId1,
                                CarreraName = j.Jugador.CarreraSemestre.CarreraId1Navigation.Nombre,
                                CodigoCarrera = j.Jugador.CarreraSemestre.CodigoCarrera,
                                Semestre = j.Jugador.CarreraSemestre.Semestre,
                                Seccion = j.Jugador.CarreraSemestre.Seccion,
                                FechaNacimiento = j.Jugador.FechaNacimiento,
                                Edad = j.Jugador.Edad,
                                Telefono = j.Jugador.Telefono,
                                asignacion = new JugadorDTO.JugadorEquipoDTO
                                {
                                    EquipoId = j.EquipoId,
                                    PosicionId = j.PosicionId,
                                    PosicionName = j.Posicion.Nombre,
                                    Dorsal = j.Dorsal,
                                    Estado = j.Estado,
                                    FacultadID = j.Equipo.FacultadId
                                }
                            }).ToListAsync();   
            return jugadores;
        }

        public async Task UpdatePlayer (string linkNuevo, int jugadorID,JugadorDTO.UpdateJugadorDTO datosNuevos)
        {
            var jugador = await _appDbContext.Jugadors.Where(j => j.JugadorId == jugadorID).FirstOrDefaultAsync();

            if (jugador != null)
            {
                if (linkNuevo != null)
                {
                    if (linkNuevo.ToLower() == "borrar")
                    {
                        jugador.Fotografia = null;
                    }
                    else
                    {
                        jugador.Fotografia = linkNuevo;
                    }  
                }
                jugador.Nombre = datosNuevos.Nombre;
                jugador.Apellido = datosNuevos.Apellido;
                jugador.Carne = datosNuevos.Carne;
                jugador.MunicipioId = datosNuevos.MunicipioId;
                jugador.CarreraSemestreId = datosNuevos.CarreraSemestreId;
                jugador.FechaNacimiento = datosNuevos.FechaNacimiento;
                jugador.Edad = datosNuevos.Edad;
                jugador.Telefono = datosNuevos.Telefono;

                await _appDbContext.SaveChangesAsync();
            } else
            {
                throw new Exception("El jugador no fue encontrado");
            }

        }

        public async Task<List<JugadorDTO>> SearchPlayer(string query)
        {
            var Jugadores = await _appDbContext.JugadorEquipos
                            .Where(j => j.Jugador.Nombre.ToLower().Contains(query.ToLower())
                            || j.Jugador.Apellido.ToLower().Contains(query.ToLower())
                            || j.Jugador.Carne.ToString().ToLower().Contains(query.ToLower())
                            && j.Estado == true)
                            .Select(j => new JugadorDTO
                            {
                                JugadorId = j.JugadorId,
                                Carne = j.Jugador.Carne,
                                Nombre = j.Jugador.Nombre,
                                Apellido = j.Jugador.Apellido,
                                Fotografia = j.Jugador.Fotografia,
                                Estado = (JugadorDTO.EstadoJugador)j.Jugador.Estado,
                                MunicipioId = j.Jugador.MunicipioId,
                                MunicipioName = j.Jugador.Municipio.Nombre,
                                DepartamentoId = j.Jugador.Municipio.DepartamentoId,
                                DepartamentoName = j.Jugador.Municipio.Departamento.Nombre,
                                CarreraSemestreId = j.Jugador.CarreraSemestreId,
                                CarreraId = j.Jugador.CarreraSemestre.CarreraId1,
                                CarreraName = j.Jugador.CarreraSemestre.CarreraId1Navigation.Nombre,
                                CodigoCarrera = j.Jugador.CarreraSemestre.CodigoCarrera,
                                Semestre = j.Jugador.CarreraSemestre.Semestre,
                                Seccion = j.Jugador.CarreraSemestre.Seccion,
                                FechaNacimiento = j.Jugador.FechaNacimiento,
                                Edad = j.Jugador.Edad,
                                Telefono = j.Jugador.Telefono,
                                asignacion = new JugadorDTO.JugadorEquipoDTO
                                {
                                    EquipoId = j.EquipoId,
                                    PosicionId = j.PosicionId,
                                    PosicionName = j.Posicion.Nombre,
                                    Dorsal = j.Dorsal,
                                    Estado = j.Estado,
                                    FacultadID = j.Equipo.FacultadId
                                }
                            }).ToListAsync();
            return Jugadores;
        }

        public async Task<bool> VerifyCarne(int carne, int idJugador)
        {
            var jugador = await _appDbContext.Jugadors
                .Where(j => j.Carne == carne && j.JugadorId != idJugador)
                .FirstOrDefaultAsync();

            return jugador != null;
        }

    }
}
