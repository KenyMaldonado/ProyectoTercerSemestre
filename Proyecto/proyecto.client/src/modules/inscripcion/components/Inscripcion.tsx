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

  useEffect(() => {
    const fetchData = async () => {
      const [facRes, posRes, munRes, carRes] = await Promise.all([
        api.get("/TeamManagementControllers/GetFacultades"),
        api.get("/TeamManagementControllers/GetPosiciones"),
        api.get("/TeamManagementControllers/GetMunicipios"),
        api.get("/TeamManagementControllers/GetCarrerasSemestres"),
      ]);
      setFacultades(facRes.data.data);
      setPosiciones(posRes.data.data);
      setMunicipios(munRes.data.data);
      setCarreras(carRes.data.data);
    };
    fetchData();
  }, []);

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
    setPlayers([
      {
        carne: captain.carne,
        dorsal: "",
        facultadId: "",
        posicionId: "",
        isCaptain: true,
      },
    ]);
  };

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
                    type="text"
                    value={captain.apellido}
                    onChange={(e) =>
                      setCaptain({ ...captain, apellido: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    value={captain.telefono}
                    onChange={(e) =>
                      setCaptain({ ...captain, telefono: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Carné</Form.Label>
                  <Form.Control
                    type="number"
                    value={captain.carne}
                    onChange={(e) =>
                      setCaptain({ ...captain, carne: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha de nacimiento</Form.Label>
                  <Form.Control
                    type="date"
                    value={captain.fechaNacimiento}
                    onChange={(e) =>
                      setCaptain({
                        ...captain,
                        fechaNacimiento: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Edad</Form.Label>
                  <Form.Control
                    type="number"
                    value={captain.edad}
                    onChange={(e) =>
                      setCaptain({
                        ...captain,
                        edad: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
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
                  >
                    <option value="">Selecciona un municipio</option>
                    {municipios.map((m: any) => (
                      <option key={m.municipioId} value={m.municipioId}>
                        {m.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Carrera y Semestre</Form.Label>
                  <Form.Select
                    value={captain.carreraSemestreId}
                    onChange={(e) =>
                      setCaptain({
                        ...captain,
                        carreraSemestreId: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="">Selecciona una opción</option>
                    {carreras.map((c: any) => (
                      <option
                        key={c.carreraSemestreId}
                        value={c.carreraSemestreId}
                      >
                        {c.nombreCarrera} - Semestre {c.semestre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Posición ID</Form.Label>
                  <Form.Control
                    type="number"
                    value={captain.posicionId}
                    onChange={(e) =>
                      setCaptain({
                        ...captain,
                        posicionId: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Dorsal</Form.Label>
                  <Form.Control
                    type="number"
                    value={captain.dorsal}
                    onChange={(e) =>
                      setCaptain({
                        ...captain,
                        dorsal: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </Form.Group>
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
                    <h5>Jugador {index + 1}</h5>
                    <Form.Control
                      className="mb-2"
                      placeholder="Carné"
                      value={player.carne}
                      onChange={(e) =>
                        updatePlayer(index, "carne", e.target.value)
                      }
                    />
                    <Form.Control
                      className="mb-2"
                      placeholder="Dorsal"
                      value={player.dorsal}
                      onChange={(e) =>
                        updatePlayer(index, "dorsal", e.target.value)
                      }
                    />
                    <Form.Select
                      className="mb-2"
                      value={player.facultadId}
                      onChange={(e) =>
                        updatePlayer(index, "facultadId", e.target.value)
                      }
                    >
                      <option value="">Selecciona una facultad</option>
                      {facultades.map((f: any) => (
                        <option key={f.facultadId} value={f.facultadId}>
                          {f.nombre}
                        </option>
                      ))}
                    </Form.Select>
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
                    <Button
                      variant="danger"
                      onClick={() => eliminarJugador(index)}
                    >
                      Eliminar jugador
                    </Button>
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
                onClick={() => {
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
                  stepper.next();
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
