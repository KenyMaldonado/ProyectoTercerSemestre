import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../../../../services/api";

const EmailRequest = ({ onEmailSent }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const correoRegex =
    /^[^\s@]+@(umes\.edu\.gt|gmail\.com|outlook\.com|yahoo\.com)$/;

  const handleSubmit = async () => {
    if (!correoRegex.test(email)) {
      Swal.fire(
        "Correo inválido",
        "Ingresa un correo con dominio válido: @umes.edu.gt, @gmail.com, @outlook.com o @yahoo.com",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        "/TeamManagementControllers/RegistrationStart",
        null,
        {
          params: { correo: email },
        }
      );

      if (response.data.success) {
        Swal.fire(
          "Código asignado",
          `Tu código es: ${response.data.data.codigo}`,
          "info"
        );
        onEmailSent(response.data.data.preInscripcionId);
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Error desconocido",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      Swal.fire(
        "Error",
        "No se pudo enviar el código de verificación",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card-body">
        <Form.Group className="mb-3">
          <Form.Label>Correo institucional</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@umes.edu.gt"
          />
          <Form.Text className="text-muted">
            Ingresa tu correo institucional para recibir un código de
            verificación.
          </Form.Text>
        </Form.Group>
        <Button
          variant="primary"
          onClick={handleSubmit}
          className="w-100"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Validar correo y generar código"}
        </Button>
      </div>
    </div>
  );
};

export default EmailRequest;
