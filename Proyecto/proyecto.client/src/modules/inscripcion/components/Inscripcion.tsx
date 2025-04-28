import { useState, useEffect } from "react";
import { Container, Button, Card, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Inscripcion.css"; // Aquí puedes tener los estilos para las bolitas animadas

const Inscripcion = () => {
  const [paso, setPaso] = useState(1);
  const [correoUsuario, setCorreoUsuario] = useState("");
  const [isNuevaInscripcion, setIsNuevaInscripcion] = useState(null);
  const [torneosActivos, setTorneosActivos] = useState<any[]>([]);
  const totalPasos = 4;

  const [formData, setFormData] = useState({
    entrenador: { nombre: "", email: "" },
    torneo: { nombre: "", rama: "" },
    equipo: { nombre: "", categoria: "" },
    jugadores: [{ nombre: "", edad: "" }],
  });

  // Inicia o recupera inscripción con el correo
  const iniciarInscripcion = () => {
    if (!correoUsuario) {
      Swal.fire({
        title: "Error!",
        text: "Por favor, ingresa un correo electrónico.",
        icon: "error",
        confirmButtonText: "Continuar",
      });
      return;
    }

    const datosGuardados = localStorage.getItem(`formulario-${correoUsuario}`);
    if (datosGuardados) {
      const { paso, formData } = JSON.parse(datosGuardados);
      setFormData(formData);
      setPaso(paso);
      setIsNuevaInscripcion(false);
      setCorreoUsuario(formData.entrenador.email);
    } else {
      setPaso(1);
      setFormData({
        entrenador: { nombre: "", email: correoUsuario },
        torneo: { nombre: "", rama: "" },
        equipo: { nombre: "", categoria: "" },
        jugadores: [{ nombre: "", edad: "" }],
      });
      setIsNuevaInscripcion(true);
    }
  };

  useEffect(() => {
    const fetchTorneosActivos = async () => {
      try {
        const response = await fetch("http://localhost:5291/api/TournamentControllers/GetTournaments");
        const data = await response.json();

        if (response.ok) {
          setTorneosActivos(data.data);
        } else {
          console.error("Error al obtener torneos activos:", data.message);
        }
      } catch (error) {
        console.error("Error de red:", error);
      }
    };

    fetchTorneosActivos();
  }, []);

  // Guarda automáticamente el progreso
  useEffect(() => {
    if (correoUsuario && isNuevaInscripcion !== null) {
      const datos = JSON.stringify({ paso, formData });
      localStorage.setItem(`formulario-${correoUsuario}`, datos);
    }
  }, [paso, formData]);

  const handleChange = (
    e: React.ChangeEvent<any>,
    section: string,
    field: string,
    index: number | null = null
  ) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev };
      if (index !== null) {
        (updated[section as keyof typeof formData] as any)[index][field] =
          value;
      } else {
        (updated[section as keyof typeof formData] as any)[field] = value;
      }
      return updated;
    });
  };

  const agregarJugador = () => {
    setFormData((prev) => ({
      ...prev,
      jugadores: [...prev.jugadores, { nombre: "", edad: "" }],
    }));
  };

  const validarPasoActual = () => {
    switch (paso) {
      case 1:
        return formData.entrenador.nombre &&
        formData.entrenador.email &&
        formData.torneo.nombre &&
        formData.torneo.rama;
      case 2:
        return formData.equipo.nombre && formData.equipo.categoria;
      case 3:
        return formData.jugadores.every((j) => j.nombre && j.edad);
      default:
        return true;
    }
  };

  const siguiente = () => {
    if (validarPasoActual() && paso < totalPasos) {
      setPaso(paso + 1);
    } else {
      alert(
        "Por favor completa todos los campos requeridos antes de continuar."
      );
    }
  };

  const anterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const renderPaso = () => {
  if (!formData || !formData.entrenador || !formData.torneo || !formData.equipo || !formData.jugadores) {
    return <p>Cargando datos del formulario...</p>;
  }
    switch (paso) {
      case 1:
        return (
          <Form>
            <Form.Group>
              <Form.Label>Nombre del entrenador</Form.Label>
              <Form.Control
                type="text"
                value={formData.entrenador.nombre}
                onChange={(e) => handleChange(e, "entrenador", "nombre")}
                required
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.entrenador.email}
                onChange={(e) => handleChange(e, "entrenador", "email")}
                required
              />
            </Form.Group>
            {torneosActivos.length > 0 && (
  <Form.Group className="mt-4">
    <Form.Label>Selecciona un torneo activo</Form.Label>
    <Form.Select
      value={formData.torneo.nombre}
      onChange={(e) => {
        const torneoSeleccionado = torneosActivos.find(
          (t) => t.id.toString() === e.target.value
        );
        setFormData((prev) => ({
          ...prev,
          torneo: {
            nombre: torneoSeleccionado?.nombre || "",
            rama: torneoSeleccionado?.rama || "",
          },
        }));
      }}
      required
    >
      <option value="" disabled>
        -- Selecciona un torneo --
      </option>
      {torneosActivos.map((torneo) => (
        <option key={torneo.id} value={torneo.id}>
          {torneo.nombre}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
)}

{formData.torneo.rama && (
  <p className="mt-2">
    <strong>Rama:</strong> {formData.torneo.rama}
  </p>
)}

        </Form>
    );
      case 2:
        return (
          <Form>
            <Form.Group>
              <Form.Label>Nombre del equipo</Form.Label>
              <Form.Control
                type="text"
                value={formData.equipo.nombre}
                onChange={(e) => handleChange(e, "equipo", "nombre")}
                required
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={formData.equipo.categoria}
                onChange={(e) => handleChange(e, "equipo", "categoria")}
                required
              >
                <option label="Selecciona una categoría" disabled></option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Mixto">Mixto</option>
              </Form.Select>
            </Form.Group>
          </Form>
        );
      case 3:
        return (
          <Form>
            {formData.jugadores.map((jugador, index) => (
              <Row key={index} className="mb-3">
                <Col>
                  <Form.Control
                    placeholder="Nombre del jugador"
                    value={jugador.nombre}
                    onChange={(e) =>
                      handleChange(e, "jugadores", "nombre", index)
                    }
                    required
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Edad"
                    value={jugador.edad}
                    onChange={(e) =>
                      handleChange(e, "jugadores", "edad", index)
                    }
                    required
                  />
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={agregarJugador}>
              + Agregar jugador
            </Button>
          </Form>
        );
      case 4:
        return (
          <Card body>
            <h5>Resumen de la inscripción</h5>
            <p>
              <strong>Entrenador:</strong> {formData.entrenador.nombre} (
              {formData.entrenador.email})
            </p>
            <p>
              <strong>Equipo:</strong> {formData.equipo.nombre} - Categoría:{" "}
              {formData.equipo.categoria}
            </p>
            <p>
              <strong>Jugadores:</strong>
            </p>
            <ul>
              {formData.jugadores.map((j, i) => (
                <li key={i}>
                  {j.nombre} (Edad: {j.edad})
                </li>
              ))}
            </ul>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Inscripción a Torneos</h2>

      {isNuevaInscripcion === null ? (
        <Card className="p-4 text-center">
          <Form.Group>
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo"
              value={correoUsuario}
              onChange={(e) => setCorreoUsuario(e.target.value)}
              required
            />
          </Form.Group>
          <Button
            variant="primary"
            className="mt-3"
            onClick={iniciarInscripcion}
          >
            Continuar
          </Button>
        </Card>
      ) : (
        <Card className="p-4">
          <p>
            <strong>Correo:</strong> {formData.entrenador.email}
          </p>
          <p>
            <strong>Fecha y hora:</strong> {new Date().toLocaleString()}
          </p>

          {/* Barra de progreso tipo bolitas */}
          <div className="wizard-bar mb-4 d-flex justify-content-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`step ${paso >= num ? "active" : ""}`}>
                <div className="circle">{num}</div>
                <div className="label">Paso {num}</div>
                {num !== totalPasos && <div className="line" />}
              </div>
            ))}
          </div>

          {/* Formulario según paso */}
          {renderPaso()}

          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="secondary"
              onClick={anterior}
              disabled={paso === 1}
            >
              Atrás
            </Button>
            {paso < totalPasos ? (
              <Button variant="primary" onClick={siguiente}>
                Siguiente
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={() => alert("Formulario enviado con éxito")}
              >
                Enviar
              </Button>
            )}
          </div>
        </Card>
      )}
    </Container>
  );
};

export default Inscripcion;
