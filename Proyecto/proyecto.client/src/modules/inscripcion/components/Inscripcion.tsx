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

const StepperHeader = () => {
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
  const [codigo, setCodigo] = useState("");
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
    municipioId: 0,
    carreraSemestreId: 0,
    fechaNacimiento: "",
    edad: 0,
    posicionId: 0,
    dorsal: 0,
  });

  const addPlayer = () => {
    const newPlayer = {
      carne: "",
      dorsal: "",
      facultadId: "",
      posicionId: "",
      isCaptain: false,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const [isCarneValido, setIsCarneValido] = useState(false);
  const [jugadorVerificado, setJugadorVerificado] = useState(false);

  useEffect(() => {
    if (
      jugadorVerificado &&
      captain.carne &&
      players.length === 0 &&
      !players.find((p) => p.isCaptain)
    ) {
      setPlayers([
        {
          carne: captain.carne,
          dorsal: captain.dorsal.toString(),
          facultadId: "",
          posicionId: captain.posicionId.toString(),
          isCaptain: true,
        },
      ]);
    }
  }, [jugadorVerificado, captain]);

  const [showCapitanForm, setShowCapitanForm] = useState(false);

  useEffect(() => {
    setShowCapitanForm(false);
    setJugadorVerificado(true);
    Swal.fire(
      "Jugador verificado",
      "El jugador está disponible como capitán.",
      "success"
    ).then(() => {
      setPlayers([
        {
          carne: captain.carne,
          dorsal: captain.dorsal?.toString() || "",
          municipioId: captain.municipioId,
          carreraSemestreId: captain.carreraSemestreId,
          posicionId: captain.posicionId?.toString() || "",
          isCaptain: true,
          nombre: captain.nombre,
          apellido: captain.apellido,
          telefono: captain.telefono,
          fechaNacimiento: captain.fechaNacimiento,
        },
      ]);
      stepper.next();
    });
  }, [captain.carne]);

  useEffect(() => {
    if (selectedDepartamentoId) {
      const filtrados = municipios.filter(
        (m) => m.departamentoId === parseInt(selectedDepartamentoId)
      );
      setMunicipiosFiltrados(filtrados);
    }
  }, [selectedDepartamentoId, municipios]);

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

  const updatePlayer = (index: number, field: string, value: string) => {
    const updated = [...players];
    updated[index][field] = value;
    setPlayers(updated);
  };

  const eliminarJugador = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const filteredSubTournaments = subTournaments.filter(
    (sub) => sub.torneoId === parseInt(selectedTournament)
  );

  const updatePlayerDependentFields = (index, field, value) => {
    const updated = [...players];
    updated[index][field] = value;

    if (field === "departamentoId") {
      updated[index].municipiosFiltrados = municipios.filter(
        (m) => m.departamentoId === parseInt(value)
      );
      updated[index].municipioId = "";
    }

    if (field === "facultadId") {
      updated[index].carrerasFiltradas = carrerasFiltradas.filter(
        (c) => c.facultadId === parseInt(value)
      );
      updated[index].carrerasFiltradas = carrerasFiltradas;
      updated[index].facultadId = value;
      updated[index].carreraId = "";
    }

    if (field === "carreraId") {
      updated[index].semestresFiltrados = updated[
        index
      ].carrerasFiltradas.filter((s) => s.carreraId === parseInt(value));
      updated[index].carreraSemestreId = "";
    }

    setPlayers(updated);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        idSubtorneo: parseInt(selectedSubTournament),
        preInscripcionId: parseInt(codigo),
        capitan: {
          jugadorCapitan: {
            nombre: captain.nombre,
            apellido: captain.apellido,
            jugadorId: 0,
            carne: parseInt(captain.carne),
            fotografia: "",
            municipioId: captain.municipioId,
            carreraSemestreId: captain.carreraSemestreId,
            fechaNacimiento: captain.fechaNacimiento,
            edad: captain.edad,
            telefono: captain.telefono,
            estado: 1,
            estadoTexto: "Activo",
            asignacion: {
              posicionId: captain.posicionId,
              dorsal: captain.dorsal,
              equipoId: 0,
              jugadorId: 0,
              estado: true,
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
          torneoId: parseInt(selectedTournament),
          grupoId: 0,
          facultadId: 0,
        },
        listaJugadores: players.map((p) => ({
          nombre: "",
          apellido: "",
          jugadorId: 0,
          carne: parseInt(p.carne),
          fotografia: "",
          municipioId: 0,
          carreraSemestreId: 0,
          fechaNacimiento: new Date().toISOString().split("T")[0],
          edad: 0,
          telefono: "",
          estado: 1,
          estadoTexto: "Activo",
          asignacion: {
            posicionId: parseInt(p.posicionId),
            dorsal: parseInt(p.dorsal),
            equipoId: 0,
            jugadorId: 0,
            estado: true,
          },
        })),
      };

      await api.post(
        "/TeamManagementControllers/CreateRegistrationTeam",
        payload
      );

      Swal.fire(
        "Inscripción completada",
        "Tu inscripción ha sido enviada",
        "success"
      );
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      Swal.fire("Error", "Ocurrió un error al enviar la inscripción", "error");
    }
  };

  const verificarJugador = async (carne: string) => {
    try {
      const response = await api.post("/Players/VerifyPlayers", [
        parseInt(captain.carne),
      ]);
      const result = response.data;

      if (result.success && result.data.length > 0 && result.data[0].existe) {
        setIsCarneValido(true);
        Swal.fire("Carné válido", "El jugador ya está registrado.", "info");
        return true;
      } else {
        setIsCarneValido(false);
        Swal.fire(
          "Carné no válido",
          "El jugador no está registrado o no existe.",
          "warning"
        );
        return false;
      }
    } catch (error) {
      setIsCarneValido(false);
      console.error("Error al verificar el jugador", error);
      Swal.fire("Error", "No se pudo verificar el jugador", "error");
      return false;
    }
  };

  return (
    <div key={stepper.current.id} className="step-form animated-form">
      {isCorreoValidado && (
        <>
          <StepperHeader />
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
                          setCodigo(response.data.data.codigo);
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
                        onChange={(e) =>
                          setSelectedSubTournament(e.target.value)
                        }
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
                      onChange={(e) =>
                        setCaptain({ ...captain, carne: e.target.value })
                      }
                      required
                    />
                  </div>
                </Form.Group>

                {showCapitanForm && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        value={captain.nombre}
                        onChange={(e) =>
                          setCaptain({ ...captain, nombre: e.target.value })
                        }
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        value={captain.apellido}
                        onChange={(e) =>
                          setCaptain({ ...captain, apellido: e.target.value })
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        value={captain.telefono}
                        onChange={(e) =>
                          setCaptain({ ...captain, telefono: e.target.value })
                        }
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
                      />
                    </Form.Group>

                    <Button
                      className="mt-3"
                      onClick={() => {
                        setPlayers([
                          {
                            carne: captain.carne,
                            dorsal: captain.dorsal?.toString() || "",
                            municipioId: captain.municipioId,
                            carreraSemestreId: captain.carreraSemestreId,
                            posicionId: captain.posicionId?.toString() || "",
                            isCaptain: true,
                            nombre: captain.nombre,
                            apellido: captain.apellido,
                            telefono: captain.telefono,
                            fechaNacimiento: captain.fechaNacimiento,
                          },
                        ]);
                        stepper.next();
                      }}
                    >
                      Continuar
                    </Button>
                  </>
                )}
              </div>
            ),

            equipo: () => (
              <div>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del equipo</Form.Label>
                  <Form.Control
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </Form.Group>

                <ImagenUploader
                  label="Imagen del equipo"
                  onBase64Change={setImagenEquipo}
                />

                <Form.Group className="mb-3">
                  <Form.Label>Color uniforme principal</Form.Label>
                  <Form.Control
                    value={uniformColor}
                    onChange={(e) => setUniformColor(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Color uniforme secundario</Form.Label>
                  <Form.Control
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </Form.Group>

                {players.map((player, index) => (
                  <div key={index} className="mb-4 border p-3">
                    <h5>
                      {player.isCaptain
                        ? "Capitán (Jugador 1)"
                        : `Jugador ${index + 1}`}
                    </h5>

                    <Form.Control
                      className="mb-2"
                      placeholder="Carné"
                      value={player.carne}
                      readOnly={player.isCaptain}
                    />

                    <Form.Control
                      className="mb-2"
                      placeholder="Dorsal"
                      value={player.dorsal}
                      onChange={(e) =>
                        updatePlayer(index, "dorsal", e.target.value)
                      }
                    />

                    <Form.Group className="mb-3">
                      <Form.Label>Departamento</Form.Label>
                      <Form.Select
                        value={selectedDepartamentoId}
                        onChange={(e) =>
                          setSelectedDepartamentoId(e.target.value)
                        }
                      >
                        <option value="">Selecciona un departamento</option>
                        {departamentos.map((d) => (
                          <option
                            key={d.departamentoId}
                            value={d.departamentoId}
                          >
                            {d.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Municipio</Form.Label>
                      <Form.Select
                        className="mb-2"
                        value={player.municipioId || ""}
                        onChange={(e) =>
                          updatePlayer(index, "municipioId", e.target.value)
                        }
                      >
                        <option value="">Selecciona un municipio</option>
                        {(player.municipiosFiltrados || []).map((m) => (
                          <option key={m.municipioId} value={m.municipioId}>
                            {m.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Facultad</Form.Label>
                      <Form.Select
                        value={captain.facultadId || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCaptain({ ...captain, facultadId: value });
                          setSelectedFacultadId(value);
                        }}
                      >
                        <option value="">Selecciona una facultad</option>
                        {facultades.map((f) => (
                          <option key={f.facultadId} value={f.facultadId}>
                            {f.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Select
                        value={player.carreraId || ""}
                        onChange={(e) =>
                          updatePlayerDependentFields(
                            index,
                            "carreraId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Selecciona una carrera</option>
                        {(player.carrerasFiltradas || []).map((c) => (
                          <option key={c.carreraId} value={c.carreraId}>
                            {c.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Semestre</Form.Label>
                      <Form.Select
                        className="mb-2"
                        value={player.carreraSemestreId || ""}
                        onChange={(e) =>
                          updatePlayer(
                            index,
                            "carreraSemestreId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Selecciona un semestre</option>
                        {(player.semestresFiltrados || []).map((s) => (
                          <option
                            key={s.carreraSemestreId}
                            value={s.carreraSemestreId}
                          >
                            Semestre {s.semestre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Select
                      className="mb-2"
                      value={player.posicionId}
                      onChange={(e) =>
                        updatePlayer(index, "posicionId", e.target.value)
                      }
                    >
                      <option value="">Selecciona una posición</option>
                      {posiciones.map((p: any) => (
                        <option key={p.posicionId} value={p.posicionId}>
                          {p.nombre}
                        </option>
                      ))}
                    </Form.Select>

                    {!player.isCaptain && (
                      <Button
                        variant="danger"
                        onClick={() => eliminarJugador(index)}
                      >
                        Eliminar jugador
                      </Button>
                    )}
                  </div>
                ))}

                <Button variant="outline-primary" onClick={addPlayer}>
                  + Agregar jugador
                </Button>
              </div>
            ),
            confirmacion: () => (
              <div>
                <h4>Resumen</h4>
                <p>
                  <strong>Correo:</strong> {email}
                </p>
                <p>
                  <strong>Capitán:</strong> {captain.nombre} {captain.apellido}{" "}
                  - {captain.telefono}
                </p>
                <p>
                  <strong>Equipo:</strong> {teamName}
                </p>
                <p>
                  <strong>Colores:</strong> {uniformColor} / {secondaryColor}
                </p>
                <p>
                  <strong>Jugadores:</strong> {players.length}
                </p>
                <ul>
                  {players.map((p, i) => (
                    <li key={i}>
                      Carné: {p.carne}, Dorsal: {p.dorsal}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          })}
          <div className="step-buttons d-flex gap-3 justify-content-between align-items-center flex-wrap mt-4">
            {!stepper.isFirst && (
              <Button variant="secondary" onClick={stepper.prev}>
                Atrás
              </Button>
            )}

            {!stepper.isLast ? (
              <Button
                variant="primary"
                onClick={async () => {
                  if (stepper.current.id === "tipoTorneo") {
                    if (!selectedTournament) {
                      Swal.fire(
                        "Campo requerido",
                        "Debes seleccionar un torneo",
                        "warning"
                      );
                      return;
                    }
                    if (!selectedSubTournament) {
                      Swal.fire(
                        "Campo requerido",
                        "Debes seleccionar un subtorneo",
                        "warning"
                      );
                      return;
                    }
                  }

                  if (stepper.current.id === "capitan") {
                    if (!captain.carne) {
                      Swal.fire(
                        "Campo requerido",
                        "Debes ingresar el carné del capitán",
                        "warning"
                      );
                      return;
                    }

                    try {
                      const response = await api.post(
                        "/Players/VerifyPlayers",
                        [parseInt(captain.carne)]
                      );

                      const { data, success } = response.data;

                      if (!success) {
                        Swal.fire(
                          "Error",
                          "El servidor respondió con error",
                          "error"
                        );
                        return;
                      }

                      if (
                        !Array.isArray(data) ||
                        data.length === 0 ||
                        !data[0]
                      ) {
                        Swal.fire(
                          "Jugador no encontrado",
                          "El carné ingresado no está registrado.",
                          "warning"
                        );
                        setShowCapitanForm(true);
                        return;
                      }
                      const resultado = data[0];
                      console.log("Respuesta del backend:", resultado);
                      const existe =
                        resultado?.existe === true ||
                        resultado?.existe === "true";

                      if (!existe) {
                        setShowCapitanForm(true);
                        Swal.fire(
                          "Jugador no registrado",
                          "Llena el formulario para crear un nuevo capitán.",
                          "info"
                        );
                        return;
                      }

                      if (resultado.datosJugador.estadoTexto !== "Libre") {
                        Swal.fire(
                          "Jugador no disponible",
                          "Este jugador ya está asignado a un equipo. Por favor, ingresa otro carné.",
                          "error"
                        );
                        return;
                      }

                      const jugador = resultado.datosJugador;

                      setCaptain({
                        nombre: jugador.nombre,
                        apellido: jugador.apellido,
                        carne: jugador.carne,
                        telefono: jugador.telefono,
                        fechaNacimiento: jugador.fechaNacimiento,
                        edad: jugador.edad,
                        municipioId: jugador.municipioId,
                        carreraSemestreId: jugador.carreraSemestreId,
                        posicionId: jugador.asignacion?.posicionId || 0,
                        dorsal: jugador.asignacion?.dorsal || 0,
                      });

                      setPlayers([
                        {
                          carne: jugador.carne,
                          dorsal: jugador.asignacion?.dorsal?.toString() || "",
                          municipioId: jugador.municipioId,
                          carreraSemestreId: jugador.carreraSemestreId,
                          posicionId:
                            jugador.asignacion?.posicionId?.toString() || "",
                          isCaptain: true,
                          nombre: jugador.nombre,
                          apellido: jugador.apellido,
                          telefono: jugador.telefono,
                          fechaNacimiento: jugador.fechaNacimiento,
                        },
                      ]);

                      setShowCapitanForm(false);
                      Swal.fire(
                        "Jugador verificado",
                        "El jugador está disponible como capitán.",
                        "success"
                      );
                      stepper.next();
                      return;
                    } catch (error) {
                      console.error("Error al verificar jugador", error);
                      Swal.fire(
                        "Error",
                        "No se pudo verificar el jugador",
                        "error"
                      );
                      return;
                    }
                  } else {
                    stepper.next();
                  }
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit}>
                Finalizar inscripción
              </Button>
            )}
          </div>
        </>
      )}
      {!isCorreoValidado && (
        <div className="correo-validacion">
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
                { params: { correo: email } }
              );
              if (response.data.success) {
                setCodigo(response.data.data.codigo);
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
