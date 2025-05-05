import React, { useState } from "react";
import { defineStepper } from "@stepperize/react";
import { Button, Form } from "react-bootstrap";
import "./Inscripcion.css";
import Swal from "sweetalert2";
import useTournamentData from "../hooks/useTournamentData";
import api from "../../../services/api";

const { Scoped, useStepper, steps } = defineStepper(
  {
    id: "email",
    title: "Correo",
    description: "Ingresa tu correo para comenzar",
  },
  {
    id: "tipoTorneo",
    title: "Información del torneo",
    description: "Detalles generales del torneo",
  },
  {
    id: "participantes",
    title: "Participantes",
    description: "Añade los participantes del equipo",
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
  const [email, setEmail] = React.useState("");
  const [codigo, setCodigo] = React.useState("");

  const {
    types,
    tournaments,
    subTournaments,
    selectedType,
    setSelectedType,
    selectedTournament,
    setSelectedTournament,
    selectedSubTournament,
    setSelectedSubTournament,
  } = useTournamentData();

  const [rama, setRama] = React.useState<"M" | "F" | "MF" | "">("");
  const [equiposMasculino, setEquiposMasculino] = useState<
    number | "Indefinido"
  >(8);
  const [equiposFemenino, setEquiposFemenino] = useState<number | "Indefinido">(
    8
  );

  console.log("Tipos de torneo cargados:", types);
  console.log("Torneos cargados:", tournaments);
  console.log("Subtorneos cargados:", subTournaments);

  return (
    <div key={stepper.current.id} className="step-form animated-form">
      {stepper.current.id !== "email" && (
        <div className="user-context-box">
          <p>
            <strong>Correo:</strong> {email}
          </p>
          <p>
            <strong>Código:</strong> {codigo}
          </p>
        </div>
      )}

      {stepper.switch({
        email: () => (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Correo institucional</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ej: usuario@universidad.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Button
              variant="primary"
              onClick={async () => {
                if (!email || !email.includes("@")) {
                  Swal.fire(
                    "Correo inválido",
                    "Ingresa un correo válido",
                    "warning"
                  );
                  return;
                }

                try {
                  interface RegistrationResponse {
                    success: boolean;
                    data: { email: string; codigo: string };
                    message: string;
                  }

                  const response = await api.post(
                    "/TeamManagementControllers/RegistrationStart",
                    null,
                    {
                      params: { correo: email },
                    }
                  );

                  const { success, data, message } =
                    response.data as RegistrationResponse;

                  if (success) {
                    setEmail(data.email);
                    setCodigo(data.codigo);

                    Swal.fire({
                      title: "Código asignado",
                      text: `Tu número de inscripción es: ${data.codigo}`,
                      icon: "info",
                      confirmButtonText: "Continuar",
                    }).then(() => stepper.next());
                  } else {
                    throw new Error(message);
                  }
                } catch {
                  Swal.fire("Error", "No se pudo generar el código", "error");
                }
              }}
            >
              Validar correo y continuar
            </Button>
          </div>
        ),

        tipoTorneo: () => (
          <div className="torneo-step-dark">
            <Form.Group className="mb-4">
              <Form.Label>Seleccione la rama del torneo</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  inline
                  label="Masculino"
                  name="rama-m"
                  type="checkbox"
                  id="rama-m"
                  checked={rama?.includes("M")}
                  onChange={() =>
                    setRama((prev) =>
                      prev?.includes("M")
                        ? (prev.replace("M", "") as "M" | "F" | "MF")
                        : (((prev ?? "") + "M") as "M" | "F" | "MF")
                    )
                  }
                />
                <Form.Check
                  inline
                  label="Femenino"
                  name="rama-f"
                  type="checkbox"
                  id="rama-f"
                  checked={rama?.includes("F")}
                  onChange={() =>
                    setRama((prev) =>
                      prev?.includes("F")
                        ? (prev.replace("F", "") as "M" | "F" | "MF")
                        : (((prev ?? "") + "F") as "M" | "F" | "MF")
                    )
                  }
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Tipo de torneo</Form.Label>
              <Form.Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Selecciona un tipo</option>
                {types.map((type) => (
                  <option key={type.tipoTorneoId} value={type.tipoTorneoId}>
                    {type.nombreTipoTorneo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Torneo</Form.Label>
              <Form.Select
                value={selectedTournament ?? ""}
                onChange={(e) => setSelectedTournament(e.target.value)}
              >
                <option value="">Selecciona un torneo</option>
                {tournaments.map((torneo) => (
                  <option key={torneo.torneoId} value={torneo.torneoId}>
                    {torneo.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Subtorneo</Form.Label>
              <Form.Select
                value={selectedSubTournament}
                onChange={(e) => setSelectedSubTournament(e.target.value)}
              >
                <option value="">Selecciona un subtorneo</option>
                {subTournaments.map((sub, index) => (
                  <option key={sub.id ?? `sub-${index}`} value={sub.id}>
                    {sub.nombre ?? `Subtorneo ${index + 1}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <h3 className="my-4">Rama</h3>
            <div className="d-flex flex-wrap gap-5">
              {/* RAMA MASCULINA */}
              <div
                className="rama-box"
                style={{ opacity: rama.includes("M") ? 1 : 0.5 }}
              >
                <h5>Masculina</h5>
                <Form.Select
                  value={
                    equiposMasculino === -1
                      ? "Indefinido"
                      : equiposMasculino.toString()
                  }
                  onChange={(e) =>
                    setEquiposMasculino(
                      e.target.value === "Indefinido"
                        ? -1
                        : parseInt(e.target.value)
                    )
                  }
                  disabled={!rama.includes("M")}
                >
                  <option value="">Selecciona cantidad</option>
                  <option value="4">4 equipos</option>
                  <option value="6">6 equipos</option>
                  <option value="8">8 equipos</option>
                  <option value="10">10 equipos</option>
                  <option value="Indefinido">Indefinido</option>
                </Form.Select>
              </div>

              {/* RAMA FEMENINA */}
              <div
                className="rama-box"
                style={{ opacity: rama.includes("F") ? 1 : 0.5 }}
              >
                <h5>Femenina</h5>
                <Form.Select
                  value={
                    equiposFemenino === -1
                      ? "Indefinido"
                      : equiposFemenino.toString()
                  }
                  onChange={(e) =>
                    setEquiposFemenino(
                      e.target.value === "Indefinido"
                        ? -1
                        : parseInt(e.target.value)
                    )
                  }
                  disabled={!rama.includes("F")}
                >
                  <option value="">Selecciona cantidad</option>
                  <option value="4">4 equipos</option>
                  <option value="6">6 equipos</option>
                  <option value="8">8 equipos</option>
                  <option value="10">10 equipos</option>
                  <option value="Indefinido">Indefinido</option>
                </Form.Select>
              </div>
            </div>
          </div>
        ),

        participantes: () => (
          <div>
            <h3>{stepper.current.title}</h3>
            <p>{stepper.current.description}</p>
            <Form.Group className="mb-3">
              <Form.Label>Participantes</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Juan Pérez, Ana Torres..."
              />
            </Form.Group>
          </div>
        ),

        confirmacion: () => (
          <div>
            <h3>{stepper.current.title}</h3>
            <p>{stepper.current.description}</p>
            <p>Verifica que todos los datos sean correctos antes de enviar.</p>
          </div>
        ),
      })}

      <div className="step-buttons d-flex gap-3 justify-content-between align-items-center flex-wrap">
        {!stepper.isFirst && (
          <Button variant="secondary" onClick={stepper.prev}>
            Atrás
          </Button>
        )}

        {/* Ocultar botones en el paso "email" */}
        {stepper.current.id !== "email" && (
          <>
            <Button
              variant="outline-info"
              onClick={async () => {
                try {
                  const payload = {
                    correo: email,
                    codigo,
                    rama,
                    tipoTorneoId: selectedType,
                    torneoId: selectedTournament,
                    subTorneoId: selectedSubTournament,
                    equiposMasculino,
                    equiposFemenino,
                  };

                  const encodedJson = encodeURIComponent(
                    JSON.stringify(payload)
                  );
                  const numeroFormulario = codigo;

                  await api.patch(
                    `/TeamManagementControllers/SaveRegistration?json=${encodedJson}&NumeroFormulario=${numeroFormulario}`
                  );

                  Swal.fire({
                    title: "Progreso guardado",
                    text: "Tu progreso ha sido almacenado correctamente.",
                    icon: "success",
                    confirmButtonText: "Ok",
                  });
                } catch (error) {
                  console.error("Error guardando el progreso:", error);
                  Swal.fire({
                    title: "Error",
                    text: "No se pudo guardar el progreso.",
                    icon: "error",
                  });
                }
              }}
            >
              Guardar progreso
            </Button>

            {!stepper.isLast ? (
              <>
                {stepper.current.id === "tipoTorneo" ? (
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!rama || rama.length === 0) {
                        Swal.fire(
                          "Campo requerido",
                          "Debes seleccionar al menos una rama",
                          "warning"
                        );
                        return;
                      }
                      if (!selectedType) {
                        Swal.fire(
                          "Campo requerido",
                          "Debes seleccionar un tipo de torneo",
                          "warning"
                        );
                        return;
                      }
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
                      stepper.next();
                    }}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button variant="primary" onClick={stepper.next}>
                    Siguiente
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="success"
                onClick={() =>
                  Swal.fire({
                    title: "Inscripción completada",
                    text: "Tu inscripción ha sido enviada con éxito.",
                    icon: "success",
                    confirmButtonText: "Aceptar",
                  })
                }
              >
                Finalizar inscripción
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const InscripcionTorneo = () => {
  return (
    <Scoped>
      <div className="inscripcion-wrapper">
        <StepperHeader />
        <StepContent />
      </div>
    </Scoped>
  );
};

export default InscripcionTorneo;
