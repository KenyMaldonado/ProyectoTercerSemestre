import React, { useEffect, useState } from "react";
import { defineStepper } from "@stepperize/react";
import { Button, Form } from "react-bootstrap";
import "./Inscripcion.css";
import Swal from "sweetalert2";
import useTournamentData from "../hooks/useTournamentData";
import api from "../../../services/api";
import ImagenUploader from "./ImagenUploader";

const { Scoped, useStepper, steps } = defineStepper(
  {
    id: "tipoTorneo",
    title: "Información del torneo",
    description: "Detalles generales del torneo",
  },
  {
    id: "capitan",
    title: "Capitan",
    description: "Añade la información del capitán de equipo",
  },
  {
    id: "equipo",
    title: "Equipo",
    description: "Agrega los integrantes del equipo",
  },
  {
    id: "confirmacion",
    title: "Confirmación",
    description: "Revisa y envía la inscripción",
  }
);

const StepperHeader = ({ handleNext }: { handleNext: () => void }) => {
  const stepper = useStepper();
  return (
    <>
      <div className="stepper-container">
        {steps.map((step, index) => {
          const isActive = step.id === stepper.current.id;
          const isCompleted =
            steps.findIndex((s) => s.id === stepper.current.id) > index;

          return (
            <div
              key={step.id}
              className={`step ${isActive ? "active" : ""} ${
                isCompleted ? "completed" : ""
              }`}
            >
              <div className="circle">{index + 1}</div>
              <div className="label">
                <strong>{step.title}</strong>
              </div>
              {index < steps.length - 1 && <div className="divider" />}
            </div>
          );
        })}
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${
              ((steps.findIndex((s) => s.id === stepper.current.id) + 1) /
                steps.length) *
              100
            }%`,
          }}
        />
      </div>
    </>
  );
};

const StepContent = () => {
  const stepper = useStepper();
  const [email, setEmail] = useState("");
  const [preInscripcionId, setPreInscripcionId] = useState<number | null>(null);

  const [isCorreoValidado, setIsCorreoValidado] = useState(false);
  const [imagenEquipo, setImagenEquipo] = useState<string | null>(null);
  const correoRegex =
    /^[^\s@]+@(umes\.edu\.gt|gmail\.com|outlook\.com|yahoo\.com)$/;

  const {
    tournaments,
    subTournaments,
    selectedTournament,
    selectedSubTournament,
    setSelectedTournament,
    setSelectedSubTournament,
  } = useTournamentData();

  const [facultades, setFacultades] = useState([]);
  const [posiciones, setPosiciones] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [carreras, setCarreras] = useState([]);

  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]);
  const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
  const [semestresFiltrados, setSemestresFiltrados] = useState([]);
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState("");
  const [selectedCarreraId, setSelectedCarreraId] = useState("");
  const [selectedFacultadId, setSelectedFacultadId] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [depRes, facRes] = await Promise.all([
          api.get("/TeamManagementControllers/GetDepartamentos"),
          api.get("/TeamManagementControllers/GetFacultades"),
        ]);
        setDepartamentos(depRes.data.data);
        setFacultades(facRes.data.data);
      } catch (error) {
        console.error("Error al cargar datos generales", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!selectedDepartamentoId) return;
      try {
        const res = await api.get(
          "/TeamManagementControllers/GetMunicipiosByDepartamento",
          {
            params: { departamentoId: selectedDepartamentoId },
          }
        );
        setMunicipios(res.data.data);
      } catch (error) {
        console.error("Error al cargar municipios", error);
      }
    };

    fetchMunicipios();
  }, [selectedDepartamentoId]);

  const fetchCarreras = async (facultadId: string) => {
    try {
      const res = await api.get(
        "/TeamManagementControllers/GetCarrerasByFacultad",
        {
          params: { facultadId: facultadId },
        }
      );
      setCarreras(res.data.data);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  };

  useEffect(() => {
    const fetchCarreras = async () => {
      if (!selectedFacultadId) return;
      try {
        const res = await api.get(
          "/TeamManagementControllers/GetCarrerasByFacultad",
          {
            params: { facultadId: selectedFacultadId },
          }
        );
        setCarreras(res.data.data);
      } catch (error) {
        console.error("Error al cargar carreras", error);
      }
    };

    fetchCarreras();
  }, [selectedFacultadId]);

  useEffect(() => {
    const fetchSemestres = async () => {
      if (!selectedCarreraId) return;
      try {
        const res = await api.get(
          "/TeamManagementControllers/GetSemestreByCarrera",
          {
            params: { carreraId: selectedCarreraId },
          }
        );
        setSemestresFiltrados(res.data.data);
      } catch (error) {
        console.error("Error al cargar semestres", error);
      }
    };

    fetchSemestres();
  }, [selectedCarreraId]);

  const [teamName, setTeamName] = useState("");
  const [uniformColor, setUniformColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [players, setPlayers] = useState<any[]>([]);
  const [captain, setCaptain] = useState({
    nombre: "",
    apellido: "",
    carne: "",
    telefono: "",
    departamentoId: 0,
    municipioId: 0,
    carreraSemestreId: 0,
    fechaNacimiento: "",
    edad: 0,
    posicionId: 0,
    dorsal: 0,
  });

  const addPlayer = () => {
    // Filtrar carreras basadas en la facultad del capitán
    const carrerasFiltradas = carreras.filter(
      (c) => c.facultadId === parseInt(captain.facultadId || "0")
    );

    const newPlayer = {
      carne: "",
      dorsal: "",
      nombre: "",
      apellido: "",
      telefono: "",
      fechaNacimiento: "",
      edad: 0,
      municipioId: 0,
      carreraSemestreId: 0,
      facultadId: captain.facultadId || "",
      carreraId: "",
      departamentoId: "",
      posicionId: "",
      isCaptain: false,
      jugadorVerificado: false,
      carrerasFiltradas: carrerasFiltradas,
      semestresFiltrados: [],
      municipiosFiltrados: municipiosFiltrados,
      asignacion: {
        posicionId: "",
        posicionName: "",
        dorsal: "",
        equipoId: 0,
        jugadorId: 0,
        estado: true,
      },
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleNext = async () => {
    if (stepper.current.id === "capitan") {
      if (isCarneValido) {
        // No inicializamos players aquí, solo avanzamos
        stepper.next();
      } else {
        if (
          !captain.nombre ||
          !captain.apellido ||
          !captain.telefono ||
          !captain.fechaNacimiento ||
          !captain.facultadId
        ) {
          Swal.fire(
            "Campos incompletos",
            "Por favor complete todos los campos requeridos",
            "warning"
          );
          return;
        }
        stepper.next();
      }
    } else {
      stepper.next();
    }
  };

  const [isCarneValido, setIsCarneValido] = useState(false);
  const [jugadorVerificado, setJugadorVerificado] = useState(false);
  const [showCapitanForm, setShowCapitanForm] = useState(false);

  useEffect(() => {
    if (selectedDepartamentoId) {
      const filtrados = municipios.filter(
        (m) => m.departamentoId === parseInt(selectedDepartamentoId)
      );
      setMunicipiosFiltrados(filtrados);
    }
  }, [selectedDepartamentoId, municipios]);

  useEffect(() => {
    if (captain.departamentoId) {
      const filtrados = municipios.filter(
        (m) => m.departamentoId === parseInt(captain.departamentoId.toString())
      );
      setMunicipiosFiltrados(filtrados);
    }
  }, [captain.departamentoId, municipios]);

  useEffect(() => {
    if (captain.facultadId) {
      const filtradas = carreras.filter(
        (c) => c.facultadId === parseInt(captain.facultadId)
      );
      setCarrerasFiltradas(filtradas);
    }
  }, [captain.facultadId]);

  useEffect(() => {
    if (selectedCarreraId) {
      const filtrados = carrerasFiltradas.filter(
        (c) => c.carreraId === parseInt(selectedCarreraId)
      );
      setSemestresFiltrados(filtrados);
    }
  }, [selectedCarreraId, carrerasFiltradas]);

  useEffect(() => {
    const fetchPosiciones = async () => {
      try {
        const response = await api.get("/Players/GetPosicionesJugadores");
        console.log("Posiciones cargadas:", response.data); // Para depuración
        setPosiciones(response.data.data || []); // Acceder a response.data.data en lugar de response.data
      } catch (error) {
        console.error("Error al cargar posiciones:", error);
        setPosiciones([]);
      }
    };

    fetchPosiciones();
  }, []);

  const updatePlayer = (index: number, field: string, value: string) => {
    const updated = [...players];
    updated[index][field] = value;
    setPlayers(updated);
    // Verificar jugador cuando se ingresa el carné y tiene la longitud adecuada
    if (field === "carne" && value.length >= 8 && value.length <= 9) {
      verificarJugadorEquipo(value, index);
    }
  };

  const eliminarJugador = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const filteredSubTournaments = subTournaments.filter(
    (sub) => sub.torneoId === parseInt(selectedTournament)
  );

  const updatePlayerDependentFields = (index, field, value) => {
    const updated = [...players];

    if (field === "facultadId") {
      const carrerasFiltradas = carreras.filter(
        (c) => c.facultadId === parseInt(value)
      );
      updated[index] = {
        ...updated[index],
        facultadId: value,
        carrerasFiltradas: carrerasFiltradas,
        carreraId: "",
        carreraSemestreId: "",
        semestresFiltrados: [],
      };
    }

    if (field === "departamentoId") {
      // Filtrar municipios para el departamento seleccionado
      const municipiosFiltrados = municipios.filter(
        (m) => m.departamentoId === parseInt(value)
      );
      updated[index] = {
        ...updated[index],
        departamentoId: value,
        municipioId: "", // Resetear el municipio
        municipiosFiltrados: municipiosFiltrados,
      };
    }

    if (field === "carreraId") {
      // Obtener semestres para la carrera seleccionada
      const fetchSemestres = async () => {
        try {
          const res = await api.get(
            "/TeamManagementControllers/GetSemestreByCarrera",
            {
              params: { carreraId: value },
            }
          );

          console.log("Semestres cargados (estructura completa):", res.data); // Para depuración detallada

          // Actualizar solo el jugador específico con los semestres obtenidos
          const updatedPlayers = [...players];
          updatedPlayers[index] = {
            ...updatedPlayers[index],
            carreraId: value,
            semestresFiltrados: res.data.data || [],
            carreraSemestreId: "", // Establecer explícitamente como cadena vacía
          };
          setPlayers(updatedPlayers);
        } catch (error) {
          console.error("Error al cargar semestres:", error);
        }
      };

      fetchSemestres();
    }

    // No modificar el estado global, solo el jugador específico
    setPlayers(updated);
  };

  const handleSubmit = async () => {
    try {
      // Validar que todos los campos necesarios estén completos
      if (
        !teamName ||
        !uniformColor ||
        !selectedTournament ||
        !selectedSubTournament
      ) {
        Swal.fire(
          "Información incompleta",
          "Por favor completa toda la información del equipo y torneo",
          "warning"
        );
        return;
      }

      // Validar que el capitán tenga toda la información necesaria
      if (
        !captain.nombre ||
        !captain.apellido ||
        !captain.carne ||
        !captain.telefono ||
        !captain.fechaNacimiento ||
        !captain.facultadId ||
        !captain.carreraId ||
        !captain.carreraSemestreId ||
        !captain.posicionId ||
        !captain.dorsal
      ) {
        Swal.fire(
          "Información del capitán incompleta",
          "Por favor completa toda la información del capitán",
          "warning"
        );
        return;
      }

      // Validar que todos los jugadores tengan la información completa
      const jugadoresIncompletos = players.filter(
        (p) =>
          !p.nombre ||
          !p.apellido ||
          !p.carne ||
          !p.telefono ||
          !p.fechaNacimiento ||
          !p.facultadId ||
          !p.carreraId ||
          !p.carreraSemestreId ||
          !p.posicionId ||
          !p.dorsal
      );

      if (jugadoresIncompletos.length > 0) {
        Swal.fire(
          "Información de jugadores incompleta",
          `Hay ${jugadoresIncompletos.length} jugador(es) con información incompleta`,
          "warning"
        );
        return;
      }

      const payload = {
        idSubtorneo: parseInt(selectedSubTournament),
        preInscripcionId: preInscripcionId,
        capitan: {
          jugadorCapitan: {
            nombre: captain.nombre,
            apellido: captain.apellido,
            jugadorId: 0,
            carne: Number.isInteger(parseInt(captain.carne))
              ? parseInt(captain.carne)
              : 0,
            fotografia: "",
            municipioId: captain.municipioId,
            municipioName:
              municipios.find((m) => m.municipioId === captain.municipioId)
                ?.nombre || "",
            departamentoId: captain.departamentoId,
            departamentoName:
              departamentos.find(
                (d) => d.departamentoId === captain.departamentoId
              )?.nombre || "",
            carreraId: captain.carreraId,
            carreraName:
              carreras.find((c) => c.carreraId === captain.carreraId)?.nombre ||
              "",
            carreraSemestreId: parseInt(captain.carreraSemestreId),
            semestre: 0, // si no tienes este dato, déjalo en 0
            seccion: "", // opcional si no usas
            codigoCarrera:
              semestresFiltrados.find(
                (s) => s.carreraSemestreId === captain.carreraSemestreId
              )?.codigoCarrera || "",
            fechaNacimiento: captain.fechaNacimiento,
            edad: captain.edad,
            telefono: captain.telefono,
            estado: 1,
            estadoTexto: "Activo",
            asignacion: {
              posicionId: parseInt(captain.posicionId),
              posicionName:
                posiciones.find((p) => p.posicionId === captain.posicionId)
                  ?.nombrePosicion || "",
              dorsal: parseInt(captain.dorsal),
              equipoId: 0,
              jugadorId: 0,
              estado: true,
              facultadID: parseInt(captain.facultadId),
            },
          },
          correoElectronico: email,
          jugadorId: 0,
        },
        newTeam: {
          equipoId: 0,
          nombre: teamName,
          colorUniforme: uniformColor,
          colorUniformeSecundario: secondaryColor,
          subTorneoId: parseInt(selectedSubTournament),
          grupoId: 0,
          facultadId: parseInt(captain.facultadId),
          nameFacultad:
            facultades.find(
              (f) => f.facultadId === parseInt(captain.facultadId)
            )?.nombre || "",
          imagenEquipo: imagenEquipo || "",
          nameSubTournament:
            subTournaments.find(
              (s) => s.subTorneoId === parseInt(selectedSubTournament)
            )?.categoria || "",
          nameTournament:
            tournaments.find((t) => t.torneoId === parseInt(selectedTournament))
              ?.nombre || "",
          estado: 1,
        },
        listaJugadores: players.map((p) => ({
          nombre: p.nombre,
          apellido: p.apellido,
          jugadorId: 0,
          carne: parseInt(p.carne),
          fotografia: "",
          municipioId: p.municipioId, // Podría ser string o número
          municipioName:
            municipios.find((m) => m.municipioId === parseInt(p.municipioId))
              ?.nombre || "",
          departamentoId: parseInt(p.departamentoId || 0),
          departamentoName:
            departamentos.find(
              (d) => d.departamentoId === parseInt(p.departamentoId)
            )?.nombre || "",
          carreraId: parseInt(p.carreraId),
          carreraName:
            carreras.find((c) => c.carreraId === parseInt(p.carreraId))
              ?.nombre || "",
          carreraSemestreId: parseInt(p.carreraSemestreId),
          semestre: 0,
          seccion: "",
          codigoCarrera:
            p.semestresFiltrados?.find(
              (s) => s.carreraSemestreId === parseInt(p.carreraSemestreId)
            )?.codigoCarrera || "",
          fechaNacimiento: p.fechaNacimiento,
          edad: p.edad,
          telefono: p.telefono,
          estado: 1,
          estadoTexto: "Activo",
          asignacion: {
            posicionId: parseInt(p.posicionId),
            posicionName:
              posiciones.find(
                (pos) => pos.posicionId === parseInt(p.posicionId)
              )?.nombrePosicion || "",
            dorsal: parseInt(p.dorsal),
            equipoId: 0,
            jugadorId: 0,
            estado: true,
            facultadID: parseInt(p.facultadId),
          },
        })),
      };

      // Antes de enviar el payload
      console.log("PAYLOAD antes de conversión:", JSON.stringify(payload, null, 2));

      // Asegurarse que todos los IDs sean números
      payload.listaJugadores = payload.listaJugadores.map(jugador => ({
        ...jugador,
        municipioId: typeof jugador.municipioId === 'string' ? parseInt(jugador.municipioId) || 0 : jugador.municipioId,
        departamentoId: typeof jugador.departamentoId === 'string' ? parseInt(jugador.departamentoId) || 0 : jugador.departamentoId,
        carreraId: typeof jugador.carreraId === 'string' ? parseInt(jugador.carreraId) || 0 : jugador.carreraId,
        carreraSemestreId: typeof jugador.carreraSemestreId === 'string' ? parseInt(jugador.carreraSemestreId) || 0 : jugador.carreraSemestreId,
      }));

      // Lo mismo para el capitán
      payload.capitan.jugadorCapitan = {
        ...payload.capitan.jugadorCapitan,
        municipioId: typeof payload.capitan.jugadorCapitan.municipioId === 'string' ? 
          parseInt(payload.capitan.jugadorCapitan.municipioId) || 0 : payload.capitan.jugadorCapitan.municipioId,
        departamentoId: typeof payload.capitan.jugadorCapitan.departamentoId === 'string' ? 
          parseInt(payload.capitan.jugadorCapitan.departamentoId) || 0 : payload.capitan.jugadorCapitan.departamentoId,
      };

      console.log("PAYLOAD después de conversión:", JSON.stringify(payload, null, 2));

      // Mostrar indicador de carga
      Swal.fire({
        title: "Enviando inscripción...",
        text: "Por favor espera mientras procesamos tu solicitud",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await api.post(
        "/TeamManagementControllers/CreateRegistrationTeam",
        payload
      );
      console.log("PAYLOAD:", JSON.stringify(payload, null, 2));

      if (response.data.success) {
        Swal.fire(
          "Inscripción completada",
          "Tu inscripción ha sido enviada correctamente",
          "success"
        ).then(() => {
          // Redirigir a la página principal o reiniciar el formulario
          window.location.href = "/";
        });
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Ocurrió un error al enviar la inscripción",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      Swal.fire("Error", "Ocurrió un error al enviar la inscripción", "error");
    }
  };

  const verificarJugador = async (carne: string) => {
    try {
      const response = await api.post("/Players/VerifyPlayers", [
        parseInt(carne),
      ]);
      const result = response.data;

      if (result.success && result.data && result.data.length > 0) {
        const jugador = result.data[0];
        const estado = jugador.datosJugador.estadoTexto;

        if (estado === "Libre") {
          setIsCarneValido(true);
          setShowCapitanForm(true);
          setJugadorVerificado(true);

          // Llenar los datos del capitán con campos bloqueados, excepto facultad
          setCaptain((prev) => ({
            ...prev,
            nombre: jugador.datosJugador.nombre,
            apellido: jugador.datosJugador.apellido,
            telefono: jugador.datosJugador.telefono,
            fechaNacimiento: jugador.datosJugador.fechaNacimiento.split("T")[0],
            edad: jugador.datosJugador.edad,
            municipioId: jugador.datosJugador.municipioId,
            departamentoId: jugador.datosJugador.departamentoId,
            carreraSemestreId: jugador.datosJugador.carreraSemestreId,
            facultadId: jugador.datosJugador.facultadId || 0,
            posicionId: jugador.datosJugador.asignacion?.posicionId || 0,
            dorsal: jugador.datosJugador.asignacion?.dorsal || 0,
          }));

          Swal.fire(
            "Jugador Encontrado",
            "Los datos del jugador han sido cargados correctamente. Solo debes seleccionar la facultad.",
            "success"
          );
          return true;
        } else {
          // Cualquier estado distinto a "Libre"
          setIsCarneValido(false);
          setShowCapitanForm(false);
          setJugadorVerificado(false);

          Swal.fire(
            "Jugador No Disponible",
            "Este jugador ya se encuentra inscrito en otro torneo o tiene una restricción.",
            "warning"
          );
          return false;
        }
      } else {
        // Jugador no encontrado en la base
        setIsCarneValido(false);
        setShowCapitanForm(true);
        setJugadorVerificado(false);

        // Resetear campos para permitir llenado manual
        setCaptain((prev) => ({
          ...prev,
          nombre: "",
          apellido: "",
          telefono: "",
          fechaNacimiento: "",
          edad: 0,
          facultadId: 0,
          municipioId: 0,
          departamentoId: 0,
          carreraSemestreId: 0,
          posicionId: 0,
          dorsal: 0,
        }));

        Swal.fire({
          icon: "info",
          title: "Jugador no registrado",
          text: "Llena el formulario para registrar un nuevo capitán.",
          showConfirmButton: true,
        });
        return false;
      }
    } catch (error) {
      setIsCarneValido(false);
      setShowCapitanForm(false);
      setJugadorVerificado(false);
      console.error("Error al verificar el jugador", error);

      Swal.fire("Error", "No se pudo verificar el jugador", "error");
      return false;
    }
  };

  const isCarnetDuplicado = (carne: string, currentIndex: number) => {
    // Verificar si el carné coincide con el del capitán
    if (captain.carne === carne) {
      return true;
    }

    // Verificar si el carné existe en otros jugadores
    return players.some(
      (player, index) => index !== currentIndex && player.carne === carne
    );
  };

  const verificarJugadorEquipo = async (carne: string, index: number) => {
    try {
      if (!carne || carne.length < 8 || carne.length > 9) {
        return;
      }
      // Primero verificar si el carné está duplicado
      if (isCarnetDuplicado(carne, index)) {
        Swal.fire(
          "Carné Duplicado",
          "Este carné ya ha sido registrado en el equipo.",
          "warning"
        );

        // Limpiar el campo de carné y otros campos
        const updatedPlayers = [...players];
        updatedPlayers[index] = {
          ...updatedPlayers[index],
          carne: "",
          nombre: "",
          apellido: "",
          telefono: "",
          fechaNacimiento: "",
          edad: 0,
          departamentoId: jugador.datosJugador.departamentoId || 0,
          municipioId: 0,
          carreraSemestreId: 0,
          facultadId: "",
          carreraId: "",
          posicionId: "",
          jugadorVerificado: false,
        };
        setPlayers(updatedPlayers);
        return;
      }
      // Si no está duplicado, verificar el jugador
      const response = await api.post("/Players/VerifyPlayers", [
        parseInt(carne),
      ]);
      const result = response.data;

      if (result.success && result.data && result.data.length > 0) {
        const jugador = result.data[0];

        if (jugador.datosJugador.estadoTexto === "Libre") {
          const updatedPlayers = [...players];
          // Usar la facultad del capitán en lugar de la del jugador
          const facultadId = captain.facultadId || "";

          // Filtrar carreras para este jugador específico basado en la facultad del capitán
          const carrerasFiltradas = carreras.filter(
            (c) => c.facultadId === parseInt(facultadId)
          );

          // Filtrar municipios para este jugador
          const municipiosFiltrados = captain.departamentoId
            ? municipios.filter(
                (m) =>
                  m.departamentoId ===
                  parseInt(captain.departamentoId.toString())
              )
            : [];

          updatedPlayers[index] = {
            ...updatedPlayers[index],
            carne: carne,
            nombre: jugador.datosJugador.nombre || "",
            apellido: jugador.datosJugador.apellido || "",
            telefono: jugador.datosJugador.telefono || "",
            fechaNacimiento: jugador.datosJugador.fechaNacimiento
              ? jugador.datosJugador.fechaNacimiento.split("T")[0]
              : "",
            edad: jugador.datosJugador.edad || 0,
            departamentoId: jugador.datosJugador.departamentoId || 0,
            municipioId: jugador.datosJugador.municipioId || 0,
            facultadId: facultadId,
            carreraId: "",
            carreraSemestreId: "",
            jugadorVerificado: true,
            carrerasFiltradas: carrerasFiltradas,
            semestresFiltrados: [],
            municipiosFiltrados: municipiosFiltrados,
          };

          setPlayers(updatedPlayers);

          Swal.fire(
            "Jugador Encontrado",
            "Los datos del jugador han sido cargados correctamente. Selecciona la carrera y el semestre.",
            "success"
          );
        }
      } else {
        // Jugador no encontrado
        const updatedPlayers = [...players];
        updatedPlayers[index] = {
          ...updatedPlayers[index],
          carne: carne,
          jugadorVerificado: false,
        };
        setPlayers(updatedPlayers);

        Swal.fire({
          icon: "info",
          title: "Jugador no registrado",
          text: "Por favor, complete todos los datos del jugador.",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error al verificar el jugador", error);
      Swal.fire("Error", "No se pudo verificar el jugador", "error");
    }
  };

  return (
    <div key={stepper.current.id} className="step-form animated-form">
      <StepperHeader handleNext={handleNext} />
      <div className="step-content">
        {stepper.switch({
          tipoTorneo: () => (
            <div>
              {!isCorreoValidado ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo institucional</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Button
                    onClick={async () => {
                      if (!correoRegex.test(email)) {
                        Swal.fire(
                          "Correo inválido",
                          "Ingresa un correo con dominio válido: @umes.edu.gt, @gmail.com, @outlook.com o @yahoo.com",
                          "warning"
                        );
                        return;
                      }
                      const response = await api.post(
                        "/TeamManagementControllers/RegistrationStart",
                        null,
                        {
                          params: { correo: email },
                        }
                      );
                      if (response.data.success) {
                        setPreInscripcionId(
                          response.data.data.preInscripcionId
                        );

                        console.log(
                          "Código recibido:",
                          response.data.data.codigo
                        );
                        setIsCorreoValidado(true);
                        Swal.fire(
                          "Código asignado",
                          `Tu código es: ${response.data.data.codigo}`,
                          "info"
                        );
                      }
                    }}
                  >
                    Validar correo y comenzar inscripción
                  </Button>
                </>
              ) : (
                <>
                  <Form.Group className="mb-4">
                    <Form.Label>Torneo</Form.Label>
                    <Form.Text className="text-muted d-block mb-2">
                      Elige el torneo al que deseas inscribirte. Solo se
                      mostrarán los torneos disponibles.
                    </Form.Text>
                    <Form.Select
                      value={selectedTournament}
                      onChange={(e) => setSelectedTournament(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un torneo</option>
                      {tournaments.map((t) => (
                        <option key={t.torneoId} value={t.torneoId}>
                          {t.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Subtorneo</Form.Label>
                    <Form.Select
                      value={selectedSubTournament}
                      onChange={(e) => setSelectedSubTournament(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un subtorneo</option>
                      {filteredSubTournaments.map((sub) => (
                        <option key={sub.subTorneoId} value={sub.subTorneoId}>
                          {`${sub.categoria} (${sub.estado}) - ${sub.cantidadEquipos} equipos`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
            </div>
          ),
          capitan: () => (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Carné del capitán</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={captain.carne}
                    onChange={(e) => {
                      setCaptain({ ...captain, carne: e.target.value });
                      // Resetear el formulario cuando se cambia el carné
                      setShowCapitanForm(false);
                      setIsCarneValido(false);
                      setJugadorVerificado(false);
                    }}
                    onBlur={async () => {
                      if (captain.carne) {
                        await verificarJugador(captain.carne);
                      }
                    }}
                    required
                  />
                </div>
              </Form.Group>

              {showCapitanForm && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Facultad</Form.Label>
                    <Form.Select
                      value={captain.facultadId}
                      onChange={(e) => {
                        setCaptain({
                          ...captain,
                          facultadId: parseInt(e.target.value),
                        });
                        setSelectedFacultadId(e.target.value);
                      }}
                      required
                    >
                      <option value="">Selecciona una facultad</option>
                      {facultades.map((facultad) => (
                        <option
                          key={facultad.facultadId}
                          value={facultad.facultadId}
                        >
                          {facultad.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      value={captain.nombre}
                      onChange={(e) =>
                        setCaptain({ ...captain, nombre: e.target.value })
                      }
                      required
                      disabled={isCarneValido}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      value={captain.apellido}
                      onChange={(e) =>
                        setCaptain({ ...captain, apellido: e.target.value })
                      }
                      disabled={isCarneValido}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Departamento</Form.Label>
                    <Form.Select
                      value={captain.departamentoId}
                      onChange={(e) => {
                        const depId = e.target.value;
                        setCaptain({
                          ...captain,
                          departamentoId: parseInt(depId),
                          // municipioId: 0, // reset municipio
                        });
                        setSelectedDepartamentoId(depId); // para cargar municipios
                      }}
                      disabled={isCarneValido}
                    >
                      <option value="">Selecciona un departamento</option>
                      {departamentos.map((dep) => (
                        <option
                          key={dep.departamentoId}
                          value={dep.departamentoId}
                        >
                          {dep.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Municipio</Form.Label>
                    <Form.Select
                      value={captain.municipioId}
                      onChange={(e) =>
                        setCaptain({
                          ...captain,
                          municipioId: parseInt(e.target.value),
                        })
                      }
                      disabled={isCarneValido}
                    >
                      <option value="">Selecciona un municipio</option>
                      {municipiosFiltrados.map((mun) => (
                        <option key={mun.municipioId} value={mun.municipioId}>
                          {mun.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      value={captain.telefono}
                      onChange={(e) =>
                        setCaptain({ ...captain, telefono: e.target.value })
                      }
                      disabled={isCarneValido}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de nacimiento</Form.Label>
                    <Form.Control
                      type="date"
                      value={captain.fechaNacimiento}
                      onChange={(e) => {
                        const fecha = e.target.value;
                        const hoy = new Date();
                        const nacimiento = new Date(fecha);
                        let edadCalculada =
                          hoy.getFullYear() - nacimiento.getFullYear();
                        const m = hoy.getMonth() - nacimiento.getMonth();
                        if (
                          m < 0 ||
                          (m === 0 && hoy.getDate() < nacimiento.getDate())
                        ) {
                          edadCalculada--;
                        }

                        setCaptain((prev) => ({
                          ...prev,
                          fechaNacimiento: fecha,
                          edad: edadCalculada,
                        }));
                      }}
                      disabled={isCarneValido}
                    />
                  </Form.Group>
                </>
              )}
            </div>
          ),

          equipo: () => (
            <div className="container">
              <h4>Datos del Equipo</h4>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Equipo</Form.Label>
                      <Form.Control
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Logo del Equipo</Form.Label>
                      <ImagenUploader onImagenSeleccionada={setImagenEquipo} />
                      {imagenEquipo && (
                        <div className="mt-2">
                          <img
                            src={imagenEquipo}
                            alt="Logo del equipo"
                            style={{ maxWidth: "100px", maxHeight: "100px" }}
                            className="img-thumbnail"
                          />
                        </div>
                      )}
                    </Form.Group>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Color de Camisola Principal</Form.Label>
                      <Form.Control
                        type="text"
                        value={uniformColor}
                        onChange={(e) => setUniformColor(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Color de Camisola Secundario</Form.Label>
                      <Form.Control
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Sección del Capitán */}
              <div className="mb-4 p-3 border rounded bg-light">
                <h5>Capitán (Jugador 1)</h5>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Carné</Form.Label>
                      <Form.Control
                        type="text"
                        value={captain.carne}
                        disabled
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        value={captain.nombre}
                        disabled
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        value={captain.apellido}
                        disabled
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="text"
                        value={captain.telefono}
                        disabled
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento</Form.Label>
                      <Form.Control
                        type="date"
                        value={captain.fechaNacimiento}
                        disabled
                      />
                    </Form.Group>
                  </div>

                  {/* Facultad Capitan */}
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Facultad</Form.Label>
                      <Form.Select
                        value={captain.facultadId}
                        onChange={(e) => {
                          setPlayers({
                            ...captain,
                            facultadId: parseInt(e.target.value),
                          });
                          setSelectedFacultadId(e.target.value);
                        }}
                        required
                        disabled
                      >
                        <option value="">Selecciona una facultad</option>
                        {facultades.map((facultad) => (
                          <option
                            key={facultad.facultadId}
                            value={facultad.facultadId}
                          >
                            {facultad.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>

                {/* Carrera y Semestre Capitan */}
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Carrera</Form.Label>
                      <Form.Select
                        value={selectedCarreraId}
                        onChange={(e) => {
                          setSelectedCarreraId(e.target.value);
                          setCaptain({
                            ...captain,
                            carreraId: parseInt(e.target.value),
                          });
                        }}
                        required
                      >
                        <option value="">Selecciona una carrera</option>
                        {carreras.map((carrera: any) => (
                          <option
                            key={carrera.carreraId}
                            value={carrera.carreraId}
                          >
                            {carrera.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Semestre</Form.Label>
                      <Form.Select
                        value={captain.carreraSemestreId}
                        onChange={(e) => {
                          setCaptain({
                            ...captain,
                            carreraSemestreId: parseInt(e.target.value),
                          });
                        }}
                        required
                      >
                        <option value="">Selecciona un semestre</option>
                        {semestresFiltrados.map((semestre) => (
                          <option
                            key={semestre.carreraSemestreId}
                            value={semestre.carreraSemestreId}
                          >
                            {semestre.codigoCarrera}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  {/* Posicion Capitan */}
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Posición</Form.Label>
                      <Form.Select
                        value={captain.posicionId || ""}
                        onChange={(e) => {
                          setCaptain({
                            ...captain,
                            posicionId: parseInt(e.target.value),
                          });
                        }}
                        required
                      >
                        <option value="">Selecciona una posición</option>
                        {Array.isArray(posiciones) &&
                          posiciones.map((posicion) => (
                            <option
                              key={posicion.posicionId}
                              value={posicion.posicionId}
                            >
                              {posicion.nombrePosicion} ({posicion.abreviatura})
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  {/* Dorsal Capitan */}
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Dorsal</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="99"
                        value={captain.dorsal || ""}
                        onChange={(e) => {
                          setCaptain({
                            ...captain,
                            dorsal: parseInt(e.target.value),
                          });
                        }}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Sección para agregar nuevos jugadores */}
              <div className="mt-4">
                <h5>Otros Jugadores</h5>
                {players.map((player, index) => (
                  <div key={index} className="mb-4 p-3 border rounded">
                    <h6>Jugador {index + 2}</h6>
                    <div className="row">
                      <div className="col-md-6">
                        {/* Carné y Nombre */}
                        <Form.Group className="mb-3">
                          <Form.Label>Carné</Form.Label>
                          <Form.Control
                            type="text"
                            value={player.carne}
                            onChange={(e) =>
                              updatePlayer(index, "carne", e.target.value)
                            }
                            onBlur={async () => {
                              if (player.carne) {
                                await verificarJugadorEquipo(
                                  player.carne,
                                  index
                                );
                              }
                            }}
                            required
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Nombre</Form.Label>
                          <Form.Control
                            type="text"
                            value={player.nombre}
                            onChange={(e) =>
                              updatePlayer(index, "nombre", e.target.value)
                            }
                            required
                            disabled={player.jugadorVerificado}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    {/* Apellido y Teléfono */}
                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Apellido</Form.Label>
                          <Form.Control
                            type="text"
                            value={player.apellido}
                            onChange={(e) =>
                              updatePlayer(index, "apellido", e.target.value)
                            }
                            required
                            disabled={player.jugadorVerificado}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Teléfono</Form.Label>
                          <Form.Control
                            type="text"
                            value={player.telefono}
                            onChange={(e) =>
                              updatePlayer(index, "telefono", e.target.value)
                            }
                            required
                            disabled={player.jugadorVerificado}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    {/* Departamento y Municipio */}
                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Departamento</Form.Label>
                          <Form.Select
                            value={player.departamentoId}
                            onChange={(e) => {
                              updatePlayer(
                                index,
                                "departamentoId",
                                e.target.value
                              );
                              updatePlayerDependentFields(
                                index,
                                "departamentoId",
                                e.target.value
                              );
                            }}
                            disabled={player.jugadorVerificado} // Cambiar esto
                          >
                            <option value="">Selecciona un departamento</option>
                            {departamentos.map((dep) => (
                              <option
                                key={dep.departamentoId}
                                value={dep.departamentoId}
                              >
                                {dep.nombre}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Municipio</Form.Label>
                          <Form.Select
                            value={player.municipioId}
                            onChange={(e) =>
                              updatePlayer(index, "municipioId", e.target.value)
                            }
                            required
                            disabled={player.jugadorVerificado} // Agregar esto
                          >
                            <option value="">Selecciona un municipio</option>
                            {player.municipiosFiltrados &&
                            player.municipiosFiltrados.length > 0
                              ? player.municipiosFiltrados.map((mun) => (
                                  <option
                                    key={mun.municipioId}
                                    value={mun.municipioId}
                                  >
                                    {mun.nombre}
                                  </option>
                                ))
                              : municipios
                                  .filter(
                                    (m) =>
                                      m.departamentoId ===
                                      parseInt(player.departamentoId || "0")
                                  )
                                  .map((mun) => (
                                    <option
                                      key={mun.municipioId}
                                      value={mun.municipioId}
                                    >
                                      {mun.nombre}
                                    </option>
                                  ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha de Nacimiento</Form.Label>
                          <Form.Control
                            type="date"
                            value={player.fechaNacimiento}
                            onChange={(e) =>
                              updatePlayer(
                                index,
                                "fechaNacimiento",
                                e.target.value
                              )
                            }
                            required
                            disabled={player.jugadorVerificado}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    {/* Facultad y Carrera */}
                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Facultad</Form.Label>
                          <Form.Select
                            value={captain.facultadId}
                            disabled={true}
                            required
                          >
                            <option value="">Seleccione una facultad</option>
                            {facultades.map((facultad) => (
                              <option
                                key={facultad.facultadId}
                                value={facultad.facultadId}
                              >
                                {facultad.nombre}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            La facultad es la misma que la del capitán
                          </Form.Text>
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Carrera</Form.Label>
                          <Form.Select
                            value={player.carreraId}
                            onChange={(e) => {
                              updatePlayer(index, "carreraId", e.target.value);
                              updatePlayerDependentFields(
                                index,
                                "carreraId",
                                e.target.value
                              );
                            }}
                            required
                          >
                            <option value="">Selecciona una carrera</option>
                            {player.carrerasFiltradas?.map((carrera) => (
                              <option
                                key={carrera.carreraId}
                                value={carrera.carreraId}
                              >
                                {carrera.nombre}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Semestre</Form.Label>
                          <Form.Select
                            value={player.carreraSemestreId || ""}
                            onChange={(e) => {
                              console.log(
                                "Semestre seleccionado:",
                                e.target.value
                              ); // Para depuración
                              updatePlayer(
                                index,
                                "carreraSemestreId",
                                e.target.value
                              );
                            }}
                            required
                          >
                            <option value="">Selecciona un semestre</option>
                            {Array.isArray(player.semestresFiltrados) &&
                            player.semestresFiltrados.length > 0 ? (
                              player.semestresFiltrados.map((semestre) => (
                                <option
                                  key={semestre.carreraSemestreId}
                                  value={semestre.carreraSemestreId}
                                >
                                  {semestre.codigoCarrera}
                                </option>
                              ))
                            ) : (
                              <option disabled>
                                No hay semestres disponibles
                              </option>
                            )}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </div>

                    {/* Posición y Dorsal */}
                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Posición</Form.Label>
                          <Form.Select
                            value={player.posicionId}
                            onChange={(e) =>
                              updatePlayer(index, "posicionId", e.target.value)
                            }
                            required
                          >
                            <option value="">Selecciona una posición</option>
                            {Array.isArray(posiciones) &&
                              posiciones.map((posicion) => (
                                <option
                                  key={posicion.posicionId}
                                  value={posicion.posicionId}
                                >
                                  {posicion.nombrePosicion} (
                                  {posicion.abreviatura})
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Dorsal</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="99"
                            value={player.dorsal}
                            onChange={(e) =>
                              updatePlayer(index, "dorsal", e.target.value)
                            }
                            required
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => eliminarJugador(index)}
                    >
                      Eliminar jugador
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline-primary"
                  onClick={addPlayer}
                  className="mt-3"
                >
                  <i className="fas fa-plus me-2"></i>
                  Agregar jugador
                </Button>
              </div>
            </div>
          ),
          confirmacion: () => (
            <div className="confirmation-container">
              <h3 className="text-center mb-4">Resumen de Inscripción</h3>

              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h4>Información del Torneo</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Torneo:</strong>{" "}
                        {tournaments.find(
                          (t) => t.torneoId === parseInt(selectedTournament)
                        )?.nombre || "No seleccionado"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Subtorneo:</strong>{" "}
                        {subTournaments.find(
                          (s) =>
                            s.subTorneoId === parseInt(selectedSubTournament)
                        )?.categoria || "No seleccionado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header bg-success text-white">
                  <h4>Información del Equipo</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Nombre del Equipo:</strong> {teamName}
                      </p>
                    </div>
                    <div className="col-md-6 d-flex align-items-center">
                      <p className="mb-0 me-3">
                        <strong>Color Principal:</strong>
                      </p>
                      <div
                        className="color-preview"
                        style={{
                          backgroundColor: uniformColor,
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          marginRight: "5px",
                          border: "1px solid #ccc",
                        }}
                      ></div>
                      <span>{uniformColor}</span>

                      <p className="mb-0 ms-4 me-3">
                        <strong>Color Secundario:</strong>
                      </p>
                      <div
                        className="color-preview"
                        style={{
                          backgroundColor: secondaryColor,
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          marginRight: "5px",
                          border: "1px solid #ccc",
                        }}
                      ></div>
                      <span>{secondaryColor}</span>
                    </div>
                  </div>
                  {imagenEquipo && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <p>
                          <strong>Logo del Equipo:</strong>
                        </p>
                        <img
                          src={imagenEquipo}
                          alt="Logo del equipo"
                          style={{ maxWidth: "150px", maxHeight: "150px" }}
                          className="img-thumbnail"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header bg-info text-white">
                  <h4>Información del Capitán</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <p>
                        <strong>Nombre:</strong> {captain.nombre}{" "}
                        {captain.apellido}
                      </p>
                      <p>
                        <strong>Carné:</strong> {captain.carne}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {captain.telefono}
                      </p>
                      <p>
                        <strong>Fecha de Nacimiento:</strong>{" "}
                        {new Date(captain.fechaNacimiento).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Edad:</strong> {captain.edad}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p>
                        <strong>Facultad:</strong>{" "}
                        {facultades.find(
                          (f) => f.facultadId === parseInt(captain.facultadId)
                        )?.nombre || "No seleccionada"}
                      </p>
                      <p>
                        <strong>Departamento:</strong>{" "}
                        {departamentos.find(
                          (d) =>
                            d.departamentoId ===
                            parseInt(captain.departamentoId)
                        )?.nombre || "No seleccionado"}
                      </p>
                      <p>
                        <strong>Municipio:</strong>{" "}
                        {municipios.find(
                          (m) => m.municipioId === parseInt(captain.municipioId)
                        )?.nombre || "No seleccionado"}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p>
                        <strong>Carrera:</strong>{" "}
                        {carreras.find(
                          (c) => c.carreraId === parseInt(captain.carreraId)
                        )?.nombre || "No seleccionada"}
                      </p>
                      <p>
                        <strong>Semestre:</strong>{" "}
                        {semestresFiltrados.find(
                          (s) =>
                            parseInt(s.carreraSemestreId) ===
                            parseInt(captain.carreraSemestreId)
                        )?.codigoCarrera || "No seleccionado"}
                      </p>
                      <p>
                        <strong>Posición:</strong>{" "}
                        {posiciones.find(
                          (p) => p.posicionId === parseInt(captain.posicionId)
                        )?.nombrePosicion || "No seleccionada"}
                      </p>
                      <p>
                        <strong>Dorsal:</strong> {captain.dorsal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {players.length > 0 && (
                <div className="card mb-4">
                  <div className="card-header bg-warning text-dark">
                    <h4>Jugadores del Equipo</h4>
                  </div>
                  <div className="card-body">
                    <div
                      defaultActiveKey="0"
                      className="accordion"
                      id="jugadoresAccordion"
                    >
                      {players.map((player, index) => (
                        <div className="accordion-item" key={index}>
                          <h2
                            className="accordion-header"
                            id={`heading${index}`}
                          >
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse${index}`}
                              aria-expanded="false"
                              aria-controls={`collapse${index}`}
                            >
                              <strong>Jugador {index + 1}:</strong>{" "}
                              {player.nombre} {player.apellido} - Dorsal:{" "}
                              {player.dorsal}
                            </button>
                          </h2>
                          <div
                            id={`collapse${index}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`heading${index}`}
                            data-bs-parent="#jugadoresAccordion"
                          >
                            <div className="accordion-body">
                              <div className="row">
                                <div className="col-md-4">
                                  <p>
                                    <strong>Nombre:</strong> {player.nombre}{" "}
                                    {player.apellido}
                                  </p>
                                  <p>
                                    <strong>Carné:</strong> {player.carne}
                                  </p>
                                  <p>
                                    <strong>Teléfono:</strong> {player.telefono}
                                  </p>
                                  <p>
                                    <strong>Fecha de Nacimiento:</strong>{" "}
                                    {new Date(
                                      player.fechaNacimiento
                                    ).toLocaleDateString()}
                                  </p>
                                  <p>
                                    <strong>Edad:</strong>{" "}
                                    {player.edad && player.edad > 0
                                      ? player.edad
                                      : (() => {
                                          const birth = new Date(
                                            player.fechaNacimiento
                                          );
                                          const today = new Date();
                                          let age =
                                            today.getFullYear() -
                                            birth.getFullYear();
                                          const m =
                                            today.getMonth() - birth.getMonth();
                                          if (
                                            m < 0 ||
                                            (m === 0 &&
                                              today.getDate() < birth.getDate())
                                          ) {
                                            age--;
                                          }
                                          return age;
                                        })()}
                                  </p>
                                </div>
                                <div className="col-md-4">
                                  <p>
                                    <strong>Facultad:</strong>{" "}
                                    {facultades.find(
                                      (f) =>
                                        f.facultadId ===
                                        parseInt(player.facultadId)
                                    )?.nombre || "No seleccionada"}
                                  </p>
                                  <p>
                                    <strong>Departamento:</strong>{" "}
                                    {departamentos.find(
                                      (d) =>
                                        d.departamentoId ===
                                        parseInt(player.departamentoId)
                                    )?.nombre || "No seleccionado"}
                                  </p>
                                  <p>
                                    <strong>Municipio:</strong>{" "}
                                    {municipios.find(
                                      (m) =>
                                        m.municipioId ===
                                        parseInt(player.municipioId)
                                    )?.nombre || "No seleccionado"}
                                  </p>
                                </div>
                                <div className="col-md-4">
                                  <p>
                                    <strong>Carrera:</strong>{" "}
                                    {carreras.find(
                                      (c) =>
                                        c.carreraId ===
                                        parseInt(player.carreraId)
                                    )?.nombre || "No seleccionada"}
                                  </p>
                                  <p>
                                    <strong>Semestre:</strong>{" "}
                                    {player.semestresFiltrados?.find(
                                      (s) =>
                                        parseInt(s.carreraSemestreId) ===
                                        parseInt(player.carreraSemestreId)
                                    )?.codigoCarrera || "No seleccionado"}
                                  </p>
                                  <p>
                                    <strong>Posición:</strong>{" "}
                                    {posiciones.find(
                                      (p) =>
                                        p.posicionId ===
                                        parseInt(captain.posicionId)
                                    )?.nombrePosicion || "No seleccionada"}
                                  </p>
                                  <p>
                                    <strong>Dorsal:</strong> {player.dorsal}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  className="btn-confirmar"
                >
                  Confirmar Inscripción
                </Button>
              </div>
            </div>
          ),
        })}
      </div>
      {stepper.current.id === "tipoTorneo" && !isCorreoValidado ? null : (
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="secondary"
            onClick={stepper.prev}
            disabled={stepper.isFirst}
          >
            Anterior
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={stepper.isLast}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

const InscripcionTorneo = () => {
  return (
    <Scoped>
      <div className="inscripcion-wrapper">
        <StepContent />
      </div>
    </Scoped>
  );
};

export default InscripcionTorneo;
