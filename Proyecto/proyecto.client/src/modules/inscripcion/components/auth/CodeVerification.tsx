import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../../../services/api";

const CodeVerification = ({
  onValidated,
  setTeamName,
  setUniformColor,
  setSecondaryColor,
  setImagenEquipo,
  setSelectedTournament,
  setSelectedSubTournament,
  setCaptain,
  setPlayers,
}) => {
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!codigo.trim()) {
      Swal.fire("Campo requerido", "Por favor ingresa un código.", "warning");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Obtener lista de inscripciones
      const response = await api.get("/TeamManagementControllers/GetInscripciones");
      const data = response.data.data;

      const estadosValidos = ["EnCorreccion", "Rechazada"];
      const inscripcion = data.find(
        (i) => i.codigo === codigo.trim() && estadosValidos.includes(i.estado)
      );

      if (!inscripcion) {
        Swal.fire(
          "Código inválido",
          "No se encontró una inscripción editable para este código.",
          "error"
        );
        return;
      }

      // 2. Obtener información completa
      const detalle = await api.get(
        `/TeamManagementControllers/GetInformationRegistration?InscripcionId=${inscripcion.inscripcionId}`
      );

      const info = detalle.data.data;

      // 3. Cargar datos del equipo
      setTeamName(info.infoEquipo.nombre || "");
      setUniformColor(info.infoEquipo.colorUniforme || "");
      setSecondaryColor(info.infoEquipo.colorUniformeSecundario || "");
      setImagenEquipo(info.infoEquipo.imagenEquipo || "");

      // 4. Cargar torneo y subtorneo
      setSelectedTournament(info.nombreTorneo);
      setSelectedSubTournament(info.idSubtorneo.toString());

      // 5. Cargar capitán
      const capitan = info.jugadores[0];
      setCaptain({
        nombre: capitan.nombre,
        apellido: capitan.apellido,
        carne: capitan.carne.toString(),
        telefono: capitan.telefono,
        fechaNacimiento: capitan.fechaNacimiento,
        edad: capitan.edad,
        municipioId: capitan.municipioId,
        departamentoId: capitan.departamentoId,
        carreraSemestreId: capitan.carreraSemestreId,
        posicionId: capitan.asignacion.posicionId,
        dorsal: capitan.asignacion.dorsal,
        facultadId: capitan.asignacion.facultadID,
      });

      // 6. Cargar jugadores (excluyendo al capitán)
      const jugadoresRestantes = info.jugadores.slice(1);
      const playersFormateados = jugadoresRestantes.map((j) => ({
        nombre: j.nombre,
        apellido: j.apellido,
        carne: j.carne.toString(),
        telefono: j.telefono,
        fechaNacimiento: j.fechaNacimiento,
        edad: j.edad,
        municipioId: j.municipioId,
        departamentoId: j.departamentoId,
        carreraId: j.carreraId,
        carreraSemestreId: j.carreraSemestreId,
        posicionId: j.asignacion.posicionId,
        dorsal: j.asignacion.dorsal,
        facultadId: j.asignacion.facultadID,
        jugadorVerificado: true,
        carrerasFiltradas: [],
        semestresFiltrados: [],
        municipiosFiltrados: [],
      }));

      setPlayers(playersFormateados);

      Swal.fire("Código válido", "Datos recuperados exitosamente", "success");

      // 7. Notificar al componente padre
      onValidated(inscripcion.preInscripcionId, inscripcion.correoCapitan);
    } catch (error) {
      console.error("Error al verificar código:", error);
      Swal.fire("Error", "No se pudo verificar el código", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Código de verificación</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ingresa el código recibido"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <Form.Text className="text-muted">
          Si ya tienes un código, ingrésalo para continuar con tu inscripción.
        </Form.Text>
      </Form.Group>

      <Button
        variant="success"
        onClick={handleVerifyCode}
        disabled={isLoading}
        className="w-100"
      >
        {isLoading ? "Verificando..." : "Verificar código"}
      </Button>
    </>
  );
};

export default CodeVerification;
