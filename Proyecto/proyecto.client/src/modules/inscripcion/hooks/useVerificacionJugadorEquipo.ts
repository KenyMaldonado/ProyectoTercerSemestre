import api from "../../../services/api";

export function useVerificacionJugadorEquipo({
  players,
  setPlayers,
  carreras,
  municipios,
  captain,
}) {
  const isCarnetDuplicado = (carne, currentIndex) => {
    if (captain.carne === carne) return true;
    return players.some(
      (player, index) => index !== currentIndex && player.carne === carne
    );
  };

  const verificarJugadorEquipo = async (carne, index) => {
    try {
      if (!carne || carne.length < 8 || carne.length > 9) return;
      if (isCarnetDuplicado(carne, index)) {
        alert("Carné duplicado en el equipo.");
        const updated = [...players];
        updated[index] = {
          ...updated[index],
          carne: "",
          nombre: "",
          apellido: "",
          telefono: "",
          fechaNacimiento: "",
          edad: 0,
          departamentoId: 0,
          municipioId: 0,
          carreraSemestreId: 0,
          facultadId: "",
          carreraId: "",
          posicionId: "",
          jugadorVerificado: false,
        };
        setPlayers(updated);
        return;
      }

      const res = await api.post("/Players/VerifyPlayers", [parseInt(carne)]);
      const jugador = res.data?.data?.[0];

      const facultadId = captain.facultadId || "";
      const carrerasFiltradas = carreras.filter(
        (c) => c.facultadId === parseInt(facultadId)
      );
      const municipiosFiltrados = captain.departamentoId
        ? municipios.filter(
            (m) =>
              m.departamentoId === parseInt(captain.departamentoId.toString())
          )
        : [];

      const updated = [...players];

      if (!jugador) {
        updated[index] = {
          ...updated[index],
          carne,
          jugadorVerificado: false,
          carrerasFiltradas,
          municipiosFiltrados,
          facultadId,
        };
        setPlayers(updated);
        return;
      }

      if (!jugador.aprobado && !jugador.datosJugador) {
        alert("Jugador no disponible en otro torneo.");
        return;
      }

      if (
        jugador.aprobado &&
        (!jugador.datosJugador?.nombre || jugador.datosJugador.nombre === null)
      ) {
        updated[index] = {
          ...updated[index],
          carne,
          jugadorVerificado: false,
          carrerasFiltradas,
          municipiosFiltrados,
          facultadId,
        };
        setPlayers(updated);
        return;
      }

      const datos = jugador.datosJugador;
      updated[index] = {
        ...updated[index],
        carne,
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        fechaNacimiento: datos.fechaNacimiento?.split("T")[0] || "",
        edad: datos.edad,
        departamentoId: datos.departamentoId,
        municipioId: datos.municipioId,
        facultadId,
        carreraId: "",
        carreraSemestreId: "",
        jugadorVerificado: true,
        carrerasFiltradas,
        municipiosFiltrados,
        semestresFiltrados: [],
      };

      setPlayers(updated);
    } catch (err) {
      console.error("Error al verificar jugador del equipo", err);
    }
  };

  return verificarJugadorEquipo;
}
