﻿using Proyecto.Server.DTOs;
using Proyecto.Server.Models;

namespace Proyecto.Server.BLL.Interface.InterfacesRepository
{
    public interface IPlayerRepository
    {
        List<JugadorDTO.VerifyPlayers> VerifyPlayers(List<int> carnets);
        List<JugadorDTO> GetJugadoresByTeam(int TeamId);
        Task<List<JugadorDTO.PosicionJugadorDTO>> GetPosicionesJugadores();
        Task<List<JugadorDTO>> GetPLayers(int pageNumber, int pageSize);
        Task<int> CountPlayers();
        Task UpdatePlayer(string linkNuevo, int jugadorID, JugadorDTO.UpdateJugadorDTO datosNuevos);
        Task<List<JugadorDTO>> SearchPlayer(string query);
        Task<bool> VerifyCarne(int Carne, int idJugador);
    }
}
